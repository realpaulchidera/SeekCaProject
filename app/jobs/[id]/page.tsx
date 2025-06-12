'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload, FileDisplay } from '@/components/ui/file-upload'
import { 
  MapPin, 
  Clock, 
  DollarSign,
  Building,
  Star,
  Award,
  Eye,
  Users,
  Calendar,
  Send,
  Heart,
  Share,
  ArrowLeft,
  CheckCircle,
  Paperclip
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { jobQueries, applicationQueries } from '@/lib/database'
import { fileUpload, UploadedFile } from '@/lib/file-upload'
import Link from 'next/link'

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Application form states
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [availabilityStart, setAvailabilityStart] = useState('')
  const [applicationFiles, setApplicationFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    const fetchJobAndUser = async () => {
      try {
        // Get job details
        const jobData = await jobQueries.getJobById(params.id)
        setJob(jobData)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          setProfile(profileData)

          // Check if user already applied
          if (profileData?.role === 'professional') {
            const { data: existingApplication } = await supabase
              .from('applications')
              .select('id')
              .eq('job_id', params.id)
              .eq('professional_id', user.id)
              .single()

            if (existingApplication) {
              setApplicationSubmitted(true)
            }
          }
        }

        // Increment view count
        if (jobData) {
          await supabase.rpc('increment_job_view_count', { job_id: params.id })
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        setError('Job not found')
      } finally {
        setLoading(false)
      }
    }

    fetchJobAndUser()
  }, [params.id])

  const handleApplyToJob = async () => {
    if (!user || !profile) {
      router.push('/auth/login')
      return
    }

    if (profile.role !== 'professional') {
      setError('Only professionals can apply to jobs')
      return
    }

    setApplying(true)
    setError('')

    try {
      const applicationData = {
        job_id: params.id,
        professional_id: user.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
        estimated_duration: estimatedDuration,
        availability_start: availabilityStart || null,
        status: 'pending'
      }

      await applicationQueries.createApplication(applicationData)
      
      // Attach files to application if any
      for (const file of applicationFiles) {
        await fileUpload.attachToApplication(file.id, applicationData.id)
      }
      
      setSuccess('Application submitted successfully!')
      setApplicationSubmitted(true)
      setShowApplicationForm(false)
    } catch (error: any) {
      setError(error.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const formatSalary = (job: any) => {
    const min = job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''
    const max = job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''
    const type = job.salary_type === 'hourly' ? '/hr' : job.salary_type === 'salary' ? '/year' : ''
    
    if (min && max) {
      return `${min} - ${max}${type}`
    } else if (min) {
      return `${min}+${type}`
    } else if (max) {
      return `Up to ${max}${type}`
    }
    return 'Salary not specified'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Link href="/jobs">
              <Button>Browse Other Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                      <Badge variant="outline" className="capitalize">
                        {job.job_type.replace('-', ' ')}
                      </Badge>
                      {job.is_urgent && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.profiles?.company_name || 'Company'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location || 'Remote'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeAgo(job.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {job.view_count} views
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {job.application_count} applicants
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Expires {new Date(job.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      {formatSalary(job)}
                    </p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Licenses */}
            {job.required_licenses && job.required_licenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.required_licenses.map((license: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                        <Award className="w-3 h-3 mr-1" />
                        {license}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Form */}
            {showApplicationForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                  <CardDescription>
                    Tell the employer why you're the perfect fit for this role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <textarea
                      id="coverLetter"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why you're interested in this role and how your experience makes you a great fit..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proposedRate">Your Rate ({job.salary_type})</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="proposedRate"
                          type="number"
                          value={proposedRate}
                          onChange={(e) => setProposedRate(e.target.value)}
                          placeholder="75"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                      <Input
                        id="estimatedDuration"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="e.g., 2-3 weeks, 6 months"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityStart">Available to Start</Label>
                    <Input
                      id="availabilityStart"
                      type="date"
                      value={availabilityStart}
                      onChange={(e) => setAvailabilityStart(e.target.value)}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Supporting Documents</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Upload your resume, portfolio, or other relevant documents
                    </p>
                    <FileUpload
                      userId={user.id}
                      folder="applications"
                      maxFiles={5}
                      onFileUploaded={(file) => setApplicationFiles(prev => [...prev, file])}
                      onFileRemoved={(fileId) => setApplicationFiles(prev => prev.filter(f => f.id !== fileId))}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApplicationForm(false)}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleApplyToJob} disabled={applying || !coverLetter}>
                      {applying ? 'Submitting...' : 'Submit Application'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardContent className="p-6">
                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {user ? (
                  profile?.role === 'professional' ? (
                    applicationSubmitted ? (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-2">Application Submitted</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Your application has been sent to the employer. You'll be notified of any updates.
                        </p>
                        <Button variant="outline" className="w-full">
                          View Application Status
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setShowApplicationForm(true)}
                      >
                        Apply Now
                      </Button>
                    )
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Only professionals can apply to jobs
                      </p>
                      <Link href="/browse">
                        <Button variant="outline" className="w-full">
                          Browse Professionals
                        </Button>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Sign in to apply for this job
                    </p>
                    <Link href="/auth/login">
                      <Button className="w-full" size="lg">
                        Sign In to Apply
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.profiles?.avatar_url} alt={job.profiles?.company_name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {job.profiles?.company_name?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {job.profiles?.company_name || 'Company'}
                      </h3>
                      {job.profiles?.is_verified && (
                        <Award className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.profiles?.location || 'Location not specified'}
                    </p>
                    {job.profiles?.bio && (
                      <p className="text-sm text-gray-700">
                        {job.profiles.bio}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    View Company Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job.application_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{job.view_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">{getTimeAgo(job.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expires</span>
                  <span className="font-medium">
                    {new Date(job.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      Senior Project Manager
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">TechCorp • Remote</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">$80-120/hr</span>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                  </div>
                ))}
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="w-full">
                    View More Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}