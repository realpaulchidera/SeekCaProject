'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Star, 
  MapPin, 
  DollarSign,
  Clock,
  Eye,
  MessageSquare,
  CheckCircle,
  X,
  Filter,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { applicationQueries, jobQueries } from '@/lib/database'

export default function HirerApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const getJobsAndApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Get user's jobs
        const jobsData = await jobQueries.getJobsByHirer(user.id)
        setJobs(jobsData)

        // Select first job if available
        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0])
          loadApplications(jobsData[0].id)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getJobsAndApplications()
  }, [router])

  const loadApplications = async (jobId: string) => {
    try {
      const applicationsData = await applicationQueries.getApplicationsByJob(jobId)
      setApplications(applicationsData)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await applicationQueries.updateApplicationStatus(applicationId, status, notes)
      
      // Refresh applications
      if (selectedJob) {
        loadApplications(selectedJob.id)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'hired':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications</h1>
          <p className="text-gray-600">
            Review and manage applications for your job postings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Jobs Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Jobs</CardTitle>
                <CardDescription>
                  Select a job to view applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600 mb-4">No jobs posted yet</p>
                    <Button size="sm">Post a Job</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedJob?.id === job.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedJob(job)
                          loadApplications(job.id)
                        }}
                      >
                        <h3 className="font-medium text-sm text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{job.application_count} applications</span>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications */}
          <div className="lg:col-span-3">
            {selectedJob ? (
              <>
                {/* Job Info */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {selectedJob.title}
                        </h2>
                        <div className="flex items-center space-x-4 text-gray-600 text-sm">
                          <span>{selectedJob.application_count} applications</span>
                          <span>{selectedJob.view_count} views</span>
                          <span>Posted {getTimeAgo(selectedJob.created_at)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {selectedJob.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Applications</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredApplications.length} of {applications.length} applications
                  </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedStatus === 'all' ? 'No applications yet' : `No ${selectedStatus} applications`}
                      </h3>
                      <p className="text-gray-600">
                        {selectedStatus === 'all' 
                          ? "Applications will appear here when professionals apply to this job"
                          : `No applications with ${selectedStatus} status`
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {filteredApplications.map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Avatar */}
                            <Avatar className="h-16 w-16">
                              <AvatarImage 
                                src={application.profiles?.avatar_url} 
                                alt={`${application.profiles?.first_name} ${application.profiles?.last_name}`} 
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                                {application.profiles?.first_name?.[0]}{application.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>

                            {/* Main Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {application.profiles?.first_name} {application.profiles?.last_name}
                                    </h3>
                                    <Badge className={getStatusColor(application.status)}>
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-gray-600 text-sm mb-2">
                                    <span className="font-medium">
                                      {application.professional_profiles?.title || 'Professional'}
                                    </span>
                                    {application.professional_profiles?.rating && (
                                      <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                        <span>{application.professional_profiles.rating}</span>
                                        <span className="text-gray-500">
                                          ({application.professional_profiles.total_reviews})
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-4 text-gray-600 text-sm">
                                    {application.proposed_rate && (
                                      <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        ${application.proposed_rate}/hr
                                      </div>
                                    )}
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      Applied {getTimeAgo(application.created_at)}
                                    </div>
                                    {application.estimated_duration && (
                                      <span>Duration: {application.estimated_duration}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  {application.professional_profiles?.hourly_rate && (
                                    <p className="text-lg font-semibold text-green-600">
                                      ${application.professional_profiles.hourly_rate}/hr
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Cover Letter */}
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {application.cover_letter}
                                </p>
                              </div>

                              {/* Skills */}
                              {application.professional_profiles?.skills && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {application.professional_profiles.skills.slice(0, 6).map((skill: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {application.professional_profiles.skills.length > 6 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{application.professional_profiles.skills.length - 6} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Button size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message
                                  </Button>
                                </div>

                                {application.status === 'pending' && (
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Shortlist
                                    </Button>
                                  </div>
                                )}

                                {application.status === 'shortlisted' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, 'hired')}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Hire
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job</h3>
                  <p className="text-gray-600">
                    Choose a job from the sidebar to view its applications
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}