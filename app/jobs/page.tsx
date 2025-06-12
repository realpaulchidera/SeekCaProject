'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign,
  Filter,
  Briefcase,
  Star,
  Building,
  Zap,
  Wrench,
  Home,
  Users,
  Truck,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { jobQueries, Job } from '@/lib/database'
import { supabase } from '@/lib/supabase'

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Technical and skilled professional job categories
  const categories = [
    { id: 'all', name: 'All Jobs', count: 24, icon: Briefcase },
    { id: 'engineering', name: 'Engineering', count: 8, icon: Zap },
    { id: 'construction', name: 'Construction & Trades', count: 6, icon: Wrench },
    { id: 'real-estate', name: 'Real Estate', count: 4, icon: Building },
    { id: 'project-management', name: 'Project Management', count: 3, icon: Users },
    { id: 'design', name: 'Design & Architecture', count: 2, icon: Home },
    { id: 'services', name: 'Personal Services', count: 1, icon: Truck }
  ]

    },
    {
      id: 2,
      title: 'Senior Project Manager - Infrastructure Development',
      company: 'Metro Construction Group',
      location: 'New York, NY',
      type: 'Contract',
      salary: '$85 - $120/hour',
      description: 'PMP-certified project manager needed for $50M infrastructure project. Experience with municipal projects and stakeholder management required.',
      skills: ['PMP Certification', 'Risk Management', 'Budget Control', 'Stakeholder Management'],
      postedAt: '1 day ago',
      applicants: 12,
      rating: 4.9,
      category: 'project-management',
      urgent: true,
      verified: true,
      requirements: ['PMP Certification', '10+ years experience', 'Infrastructure background']
    },
    {
      id: 3,
      title: 'Real Estate Development Consultant',
      company: 'Urban Development Partners',
      location: 'Miami, FL',
      type: 'Freelance',
      salary: '$120 - $180/hour',
      description: 'Experienced real estate developer needed for mixed-use project feasibility study and development planning. Must have track record with similar projects.',
      skills: ['Property Development', 'Financial Analysis', 'Zoning Laws', 'Market Research'],
      postedAt: '3 days ago',
      applicants: 5,
      rating: 4.7,
      category: 'real-estate',
      urgent: false,
      verified: true,
      requirements: ['Real Estate License', 'Development experience', 'Financial modeling']
    },
    {
      id: 4,
      title: 'Master Plumber - Emergency Services',
      company: 'Rapid Response Plumbing',
      location: 'Chicago, IL',
      type: 'Part-time',
      salary: '$75 - $95/hour',
      description: 'Licensed master plumber for emergency repair services. Must be available for on-call work and have own tools and vehicle.',
      skills: ['Master Plumber License', 'Emergency Repairs', 'Pipe Installation', 'Drain Cleaning'],
      postedAt: '5 hours ago',
      applicants: 3,
      rating: 4.6,
      category: 'construction',
      urgent: true,
      verified: true,
      requirements: ['Master Plumber License', 'Own tools', 'Reliable vehicle']
    },
    {
      id: 5,
      title: 'Mechanical Engineer - HVAC Systems',
      company: 'Climate Control Solutions',
      location: 'Phoenix, AZ',
      type: 'Full-time',
      salary: '$80,000 - $110,000',
      description: 'HVAC design engineer for commercial and industrial projects. Experience with energy-efficient systems and sustainable design preferred.',
      skills: ['HVAC Design', 'Energy Modeling', 'AutoCAD', 'ASHRAE Standards'],
      postedAt: '1 week ago',
      applicants: 15,
      rating: 4.8,
      category: 'engineering',
      urgent: false,
      verified: true,
      requirements: ['Mechanical Engineering Degree', 'HVAC experience', 'CAD proficiency']
    },
    {
      id: 6,
      title: 'Interior Designer - Luxury Residential',
      company: 'Elite Design Studio',
      location: 'Beverly Hills, CA',
      type: 'Contract',
      salary: '$60 - $85/hour',
      description: 'NCIDQ-certified interior designer for high-end residential projects. Must have portfolio of luxury homes and experience with custom millwork.',
      skills: ['Interior Design', 'Space Planning', '3D Rendering', 'Luxury Materials'],
      postedAt: '4 days ago',
      applicants: 9,
      rating: 4.5,
      category: 'design',
      urgent: false,
      verified: true,
      requirements: ['NCIDQ Certification', 'Luxury portfolio', '3D software skills']
    },
    {
      id: 7,
      title: 'Personal Assistant & Errand Services',
      company: 'Executive Support Services',
      location: 'Seattle, WA',
      type: 'Part-time',
      salary: '$25 - $40/hour',
      description: 'Reliable personal assistant for busy executives. Tasks include shopping, deliveries, appointment scheduling, and general administrative support.',
      skills: ['Administrative Support', 'Time Management', 'Driving License', 'Discretion'],
      postedAt: '2 days ago',
      applicants: 7,
      rating: 4.4,
      category: 'services',
      urgent: false,
      verified: true,
      requirements: ['Clean driving record', 'Background check', 'References']
    },
    {
      id: 8,
      title: 'Structural Engineer - Seismic Retrofitting',
      company: 'Earthquake Safety Engineering',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$110 - $150/hour',
      description: 'Licensed structural engineer specializing in seismic retrofitting of existing buildings. California SE license required.',
      skills: ['Structural Analysis', 'Seismic Design', 'Building Codes', 'Retrofit Design'],
      postedAt: '6 days ago',
      applicants: 4,
      rating: 4.9,
      category: 'engineering',
      urgent: false,
      verified: true,
      requirements: ['SE License', 'Seismic experience', 'California projects']
    },
    {
      id: 9,
      title: 'Construction Supervisor - Commercial Build-out',
      company: 'Premier Construction',
      location: 'Dallas, TX',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'Experienced construction supervisor for commercial tenant improvements. Must have OSHA certification and experience managing subcontractors.',
      skills: ['Construction Management', 'OSHA Certification', 'Quality Control', 'Safety Management'],
      postedAt: '3 days ago',
      applicants: 11,
      rating: 4.7,
      category: 'construction',
      urgent: false,
      verified: true,
      requirements: ['OSHA 30', 'Supervisor experience', 'Commercial background']
    },
    {
      id: 10,
      title: 'Electrician - Industrial Maintenance',
      company: 'Industrial Power Services',
      location: 'Houston, TX',
      type: 'Full-time',
      salary: '$65,000 - $85,000',
      description: 'Licensed electrician for industrial facility maintenance. Experience with motor controls, PLCs, and high-voltage systems required.',
      skills: ['Industrial Electrical', 'Motor Controls', 'PLC Programming', 'High Voltage'],
      postedAt: '1 day ago',
      applicants: 6,
      rating: 4.6,
      category: 'construction',
      urgent: true,
      verified: true,
      requirements: ['Electrical License', 'Industrial experience', 'PLC knowledge']
    },
    {
      id: 11,
      title: 'Architect - Sustainable Design',
      company: 'Green Building Architects',
      location: 'Portland, OR',
      type: 'Full-time',
      salary: '$75,000 - $95,000',
      description: 'Licensed architect with LEED certification for sustainable building design. Experience with passive house and net-zero projects preferred.',
      skills: ['Architectural Design', 'LEED Certification', 'Sustainable Design', 'Revit'],
      postedAt: '5 days ago',
      applicants: 8,
      rating: 4.8,
      category: 'design',
      urgent: false,
      verified: true,
      requirements: ['Architecture License', 'LEED AP', 'Sustainable projects']
    },
    {
      id: 12,
      title: 'Property Manager - Commercial Real Estate',
      company: 'Metro Property Management',
      location: 'Atlanta, GA',
      type: 'Full-time',
      salary: '$55,000 - $75,000',
      description: 'Experienced property manager for commercial office buildings. Must have real estate license and experience with tenant relations.',
      skills: ['Property Management', 'Tenant Relations', 'Lease Administration', 'Maintenance Coordination'],
      postedAt: '1 week ago',
      applicants: 13,
      rating: 4.5,
      category: 'real-estate',
      urgent: false,
      verified: true,
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const filters: any = {}
        
        if (selectedCategory !== 'all') {
          filters.category = selectedCategory
        }
        
        if (searchTerm) {
          filters.search = searchTerm
        }
        
        const jobsData = await jobQueries.getActiveJobs(filters)
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [selectedCategory, searchTerm])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
                         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.required_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatSalary = (job: Job) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Technical & Professional Opportunities</h1>
          <p className="text-gray-600">Find jobs for licensed engineers, skilled trades, project managers, and certified professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search jobs, companies, licenses, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Alerts</CardTitle>
                <CardDescription>
                  Get notified about new technical opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mb-4">Create Alert</Button>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Electrical Engineer</p>
                    <p className="text-gray-600">3 new jobs this week</p>
                  </div>
                  <div>
                    <p className="font-medium">Project Manager</p>
                    <p className="text-gray-600">5 new jobs this week</p>
                  </div>
                  <div>
                    <p className="font-medium">Master Plumber</p>
                    <p className="text-gray-600">2 new jobs this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Jobs</span>
                  <span className="font-semibold">{jobs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Licensed Required</span>
                  <span className="font-semibold">
                    {jobs.filter(job => job.requirements.some(req => req.includes('License'))).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgent Hiring</span>
                  <span className="font-semibold text-red-600">
                    {jobs.filter(job => job.urgent).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified Companies</span>
                  <span className="font-semibold text-green-600">
                    {jobs.filter(job => job.verified).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Popular Licenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'PE License',
                  'Master Plumber',
                  'PMP Certification',
                  'Real Estate License',
                  'NCIDQ Certification',
                  'OSHA Certification'
                ].map(license => (
                  <div key={license} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{license}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor(Math.random() * 10) + 2}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `Showing ${filteredJobs.length} of ${jobs.length} jobs`}
              </p>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>Most Recent</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
                <option>Most Relevant</option>
                <option>Urgent First</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                            <Badge variant="outline" className="capitalize">{job.job_type.replace('-', ' ')}</Badge>
                            {job.is_urgent && (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">
                                Urgent
                              </Badge>
                            )}
                            {job.profiles?.is_verified && (
                              <Award className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-gray-600 mb-3">
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
                          <p className="text-gray-700 mb-4">{job.description}</p>
                          
                          {/* Requirements */}
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                              <div className="flex flex-wrap gap-2">
                                {job.requirements.map((req: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.required_skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Licenses */}
                          {job.required_licenses && job.required_licenses.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Required Licenses:</p>
                              <div className="flex flex-wrap gap-2">
                                {job.required_licenses.map((license: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                                    {license}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-6 text-right">
                          <p className="text-lg font-semibold text-green-600 mb-2">{formatSalary(job)}</p>
                          <p className="text-sm text-gray-600 mb-4">{job.application_count} applicants</p>
                          <p className="text-sm text-gray-600 mb-4">{job.view_count} views</p>
                          <div className="space-y-2">
                            {user ? (
                              <>
                                <Button className="w-full">Apply Now</Button>
                                <Button variant="outline" size="sm" className="w-full">
                                  Save Job
                                </Button>
                              </>
                            ) : (
                              <Link href="/auth/login">
                                <Button className="w-full">Sign in to Apply</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all available positions.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Load More */}
            {!loading && filteredJobs.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg">
                  Load More Jobs
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}