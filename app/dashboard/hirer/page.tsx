'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Users, 
  Eye, 
  DollarSign, 
  TrendingUp,
  Plus,
  Calendar,
  MessageSquare,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/lib/supabase'
import Link from 'next/link'

export default function HirerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
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
          if (data.role !== 'hirer') {
            router.push('/dashboard/professional')
          }
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/auth/login')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile.company_name ? `, ${profile.company_name}` : ''}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and find the perfect professionals
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <Link href="/profile/edit">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <Briefcase className="h-6 w-6" />
              <span>Manage Jobs</span>
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Complete Profile</span>
            </Button>
          </Link>
          <Link href="/dashboard/hirer/messages">
            <Button variant="outline" className="h-20 w-full flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span>Messages</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                  Active Job Postings
                </CardTitle>
                <CardDescription>
                  Monitor your current job listings and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Senior React Developer</h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Posted 3 days ago • Expires in 25 days
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>12 Applications</span>
                        <span>47 Views</span>
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">UI/UX Designer</h3>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Posted 1 week ago • 3 professionals shortlisted
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>8 Applications</span>
                        <span>23 Views</span>
                      </div>
                      <Button size="sm" variant="outline">View Applications</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Content Marketing Specialist</h3>
                      <Badge variant="outline">Draft</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Created 2 days ago • Not yet published
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>Ready to publish</span>
                      </div>
                      <Button size="sm">Publish Job</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Latest applications from professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">JD</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-600">Applied to Senior React Developer</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">SM</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sarah Miller</p>
                      <p className="text-sm text-gray-600">Applied to UI/UX Designer</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">RJ</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Robert Johnson</p>
                      <p className="text-sm text-gray-600">Applied to Senior React Developer</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
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
                  <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-gray-600">Active Jobs</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-xs text-gray-600">Applications</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">147</div>
                  <div className="text-xs text-gray-600">Total Views</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-gray-600">Hired</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiring Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">💡 Write clear job descriptions</p>
                  <p className="text-gray-600">Detailed requirements attract the right candidates.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">⏰ Respond quickly</p>
                  <p className="text-gray-600">Fast responses keep top professionals interested.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">🔍 Check portfolios</p>
                  <p className="text-gray-600">Review past work to find the best fit for your project.</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Recent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium">Sarah Miller</p>
                    <p className="text-gray-600 text-xs">Thanks for considering my application...</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">John Doe</p>
                    <p className="text-gray-600 text-xs">I have some questions about the project...</p>
                    <p className="text-gray-500 text-xs">5 hours ago</p>
                  </div>
                </div>
                <Link href="/dashboard/hirer/messages">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View All Messages
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