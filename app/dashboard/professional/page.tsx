'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Briefcase, 
  Star, 
  Eye, 
  DollarSign, 
  TrendingUp,
  Plus,
  Calendar,
  MessageSquare,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/supabase'
import Link from 'next/link'

export default function ProfessionalDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          window.location.replace('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data)
          if (data.role !== 'professional') {
            window.location.replace('/dashboard/hirer')
          }
        }
      } catch (error) {
        console.error('Error:', error)
        window.location.replace('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const profileCompleteness = 65 // This would be calculated based on actual profile data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your professional profile
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/jobs">
            <Button className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <Briefcase className="h-6 w-6" />
              <span>Browse Jobs</span>
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <FileText className="h-6 w-6" />
              <span>Edit Profile</span>
            </Button>
          </Link>
          <Link href="/dashboard/professional/applications">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span>Applications</span>
            </Button>
          </Link>
          <Link href="/dashboard/professional/earnings">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <DollarSign className="h-6 w-6" />
              <span>Earnings</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Profile Status
                </CardTitle>
                <CardDescription>
                  Complete your profile to get more visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Completeness</span>
                    <span className="text-sm text-gray-600">{profileCompleteness}%</span>
                  </div>
                  <Progress value={profileCompleteness} className="h-2" />
                  <div className="flex items-center space-x-2">
                    {profile.is_verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Verification Pending
                      </Badge>
                    )}
                  </div>
                  {!profile.is_verified && (
                    <div className="mt-4">
                      <Link href="/kyc">
                        <Button size="sm">
                          Complete Verification
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest applications and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Applied to "Web Development Project"</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Profile viewed by TechCorp</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New job recommendation available</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>
                  Jobs that match your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Senior React Developer</h3>
                      <Badge variant="outline">$80-120/hr</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Looking for an experienced React developer to build a modern web application...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">React</Badge>
                        <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                        <Badge variant="secondary" className="text-xs">Node.js</Badge>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">UI/UX Design Consultation</h3>
                      <Badge variant="outline">$60-90/hr</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Need a designer to improve the user experience of our existing platform...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">Figma</Badge>
                        <Badge variant="secondary" className="text-xs">UX Research</Badge>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-xs text-gray-600">Profile Views</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-gray-600">Active Bids</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">4.8</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$2.5k</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">📝 Complete your profile</p>
                  <p className="text-gray-600">Add a professional photo and detailed bio to increase your visibility.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">⭐ Get verified</p>
                  <p className="text-gray-600">Complete your KYC process to build trust with potential clients.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">💼 Apply actively</p>
                  <p className="text-gray-600">Apply to at least 5 jobs per week to increase your chances.</p>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Client Meeting</p>
                    <p className="text-gray-600">Today, 2:00 PM</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Project Deadline</p>
                    <p className="text-gray-600">Tomorrow, EOD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}