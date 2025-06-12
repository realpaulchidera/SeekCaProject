'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Briefcase, 
  Clock, 
  DollarSign,
  Building,
  Eye,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { applicationQueries } from '@/lib/database'
import Link from 'next/link'

export default function ApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const getApplications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Get user's applications
        const applicationsData = await applicationQueries.getApplicationsByProfessional(user.id)
        setApplications(applicationsData)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    getApplications()
  }, [router])

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track your job applications and their status
          </p>
        </div>

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
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus === 'all' ? 'No applications yet' : `No ${selectedStatus} applications`}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedStatus === 'all' 
                  ? "Start applying to jobs to see your applications here"
                  : `You don't have any ${selectedStatus} applications at the moment`
                }
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.jobs?.title}
                        </h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {application.jobs?.company_name || 'Company'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Applied {getTimeAgo(application.created_at)}
                        </div>
                        {application.proposed_rate && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${application.proposed_rate}/hr
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {application.cover_letter}
                      </p>

                      {application.hirer_notes && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">Employer Notes:</p>
                          <p className="text-sm text-blue-800">{application.hirer_notes}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <Link href={`/jobs/${application.job_id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Job
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message Employer
                        </Button>
                        {application.status === 'shortlisted' && (
                          <Button size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div className="text-sm text-gray-600 mb-2">
                        Job Status: <span className="font-medium">{application.jobs?.status}</span>
                      </div>
                      {application.jobs?.salary_min && application.jobs?.salary_max && (
                        <div className="text-lg font-semibold text-green-600">
                          ${application.jobs.salary_min.toLocaleString()} - ${application.jobs.salary_max.toLocaleString()}
                          {application.jobs.salary_type === 'hourly' ? '/hr' : '/year'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Find More Jobs</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse new opportunities that match your skills
              </p>
              <Link href="/jobs">
                <Button variant="outline" className="w-full">
                  Browse Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Messages</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check your conversations with employers
              </p>
              <Link href="/messages">
                <Button variant="outline" className="w-full">
                  View Messages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Profile Views</h3>
              <p className="text-sm text-gray-600 mb-4">
                See who's viewing your professional profile
              </p>
              <Link href="/profile">
                <Button variant="outline" className="w-full">
                  View Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}