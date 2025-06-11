'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Award,
  Eye,
  Heart,
  MessageSquare,
  Wrench,
  Zap,
  Home,
  Building,
  Truck
} from 'lucide-react'

export default function BrowseProfessionals() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories', icon: Briefcase },
    { id: 'engineering', name: 'Engineering', icon: Zap },
    { id: 'construction', name: 'Construction & Trades', icon: Wrench },
    { id: 'real-estate', name: 'Real Estate', icon: Building },
    { id: 'project-management', name: 'Project Management', icon: Users },
    { id: 'design', name: 'Design & Architecture', icon: Home },
    { id: 'services', name: 'Personal Services', icon: Truck },
    { id: 'consulting', name: 'Professional Consulting', icon: Briefcase }
  ]

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'local', name: 'Local Area' },
    { id: 'us', name: 'United States' },
    { id: 'canada', name: 'Canada' },
    { id: 'uk', name: 'United Kingdom' },
    { id: 'europe', name: 'Europe' },
    { id: 'asia', name: 'Asia' }
  ]

  const experienceLevels = [
    { id: 'all', name: 'All Experience' },
    { id: 'entry', name: 'Entry Level (0-3 years)' },
    { id: 'mid', name: 'Mid Level (4-7 years)' },
    { id: 'senior', name: 'Senior Level (8-15 years)' },
    { id: 'expert', name: 'Expert Level (15+ years)' }
  ]

  // Mock data for technical professionals
  const professionals = [
    {
      id: 1,
      name: 'Robert Martinez',
      title: 'Licensed Electrical Engineer',
      location: 'Los Angeles, CA',
      hourlyRate: 125,
      rating: 4.9,
      reviewCount: 89,
      completedProjects: 156,
      responseTime: '2 hours',
      avatar: '',
      skills: ['Electrical Systems', 'Power Distribution', 'Industrial Controls', 'Code Compliance'],
      description: 'Licensed Professional Engineer with 12+ years experience in electrical system design, power distribution, and industrial automation. Specialized in commercial and industrial projects.',
      verified: true,
      availability: 'Available',
      category: 'engineering',
      license: 'PE License #12345',
      certifications: ['IEEE Member', 'NECA Certified']
    },
    {
      id: 2,
      name: 'Sarah Thompson',
      title: 'Senior Project Manager (PMP)',
      location: 'New York, NY',
      hourlyRate: 95,
      rating: 4.8,
      reviewCount: 134,
      completedProjects: 78,
      responseTime: '1 hour',
      avatar: '',
      skills: ['Project Planning', 'Risk Management', 'Agile/Scrum', 'Budget Control'],
      description: 'PMP-certified project manager with extensive experience managing complex construction and infrastructure projects. Expert in stakeholder management and delivery optimization.',
      verified: true,
      availability: 'Available',
      category: 'project-management',
      license: 'PMP Certified',
      certifications: ['PMP', 'Agile Certified', 'Six Sigma Green Belt']
    },
    {
      id: 3,
      name: 'Michael Chen',
      title: 'Real Estate Developer & Investor',
      location: 'Miami, FL',
      hourlyRate: 150,
      rating: 5.0,
      reviewCount: 67,
      completedProjects: 45,
      responseTime: '3 hours',
      avatar: '',
      skills: ['Property Development', 'Investment Analysis', 'Zoning & Permits', 'Market Research'],
      description: 'Experienced real estate developer with $50M+ in successful projects. Specializing in residential and mixed-use developments with focus on sustainable design.',
      verified: true,
      availability: 'Busy',
      category: 'real-estate',
      license: 'Real Estate License',
      certifications: ['CCIM', 'LEED AP']
    },
    {
      id: 4,
      name: 'James Wilson',
      title: 'Master Plumber',
      location: 'Chicago, IL',
      hourlyRate: 85,
      rating: 4.9,
      reviewCount: 203,
      completedProjects: 312,
      responseTime: '30 minutes',
      avatar: '',
      skills: ['Residential Plumbing', 'Commercial Systems', 'Emergency Repairs', 'Pipe Installation'],
      description: 'Master plumber with 15+ years experience. Available for emergency repairs, new installations, and complex commercial plumbing systems. Licensed and insured.',
      verified: true,
      availability: 'Available',
      category: 'construction',
      license: 'Master Plumber License',
      certifications: ['EPA Certified', 'Backflow Prevention']
    },
    {
      id: 5,
      name: 'Dr. Emily Rodriguez',
      title: 'Mechanical Engineer (PhD)',
      location: 'San Francisco, CA',
      hourlyRate: 140,
      rating: 4.8,
      reviewCount: 76,
      completedProjects: 89,
      responseTime: '4 hours',
      avatar: '',
      skills: ['HVAC Design', 'Thermal Analysis', 'CAD/SolidWorks', 'Energy Efficiency'],
      description: 'PhD Mechanical Engineer specializing in HVAC systems, thermal analysis, and energy-efficient building design. Expert in sustainable engineering solutions.',
      verified: true,
      availability: 'Available',
      category: 'engineering',
      license: 'PE License #67890',
      certifications: ['LEED AP', 'ASHRAE Member']
    },
    {
      id: 6,
      name: 'Lisa Park',
      title: 'Interior Designer (NCIDQ)',
      location: 'Austin, TX',
      hourlyRate: 75,
      rating: 4.9,
      reviewCount: 145,
      completedProjects: 198,
      responseTime: '2 hours',
      avatar: '',
      skills: ['Space Planning', '3D Visualization', 'Color Theory', 'Sustainable Design'],
      description: 'NCIDQ-certified interior designer with expertise in residential and commercial spaces. Specializing in modern, functional designs that maximize space and natural light.',
      verified: true,
      availability: 'Available',
      category: 'design',
      license: 'NCIDQ Certified',
      certifications: ['LEED Green Associate', 'WELL AP']
    },
    {
      id: 7,
      name: 'Marcus Johnson',
      title: 'Personal Assistant & Errand Service',
      location: 'Seattle, WA',
      hourlyRate: 35,
      rating: 4.7,
      reviewCount: 89,
      completedProjects: 267,
      responseTime: '15 minutes',
      avatar: '',
      skills: ['Personal Shopping', 'Delivery Services', 'Administrative Tasks', 'Pet Care'],
      description: 'Reliable personal assistant providing errand services, shopping, deliveries, and administrative support. Available for one-time tasks or ongoing assistance.',
      verified: true,
      availability: 'Available',
      category: 'services',
      license: 'Bonded & Insured',
      certifications: ['Background Checked', 'First Aid Certified']
    },
    {
      id: 8,
      name: 'David Kim',
      title: 'Structural Engineer',
      location: 'Denver, CO',
      hourlyRate: 130,
      rating: 4.9,
      reviewCount: 112,
      completedProjects: 134,
      responseTime: '3 hours',
      avatar: '',
      skills: ['Structural Analysis', 'Seismic Design', 'Steel & Concrete', 'Building Codes'],
      description: 'Licensed structural engineer with expertise in residential and commercial building design. Specialized in seismic-resistant structures and renovation assessments.',
      verified: true,
      availability: 'Available',
      category: 'engineering',
      license: 'SE License #11223',
      certifications: ['AISC Certified', 'ICC Certified']
    }
  ]

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || professional.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('')
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.icon : Briefcase
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Technical Professionals
          </h1>
          <p className="text-gray-600">
            Find licensed engineers, skilled tradespeople, and certified professionals for your projects
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {categories.map(category => {
            const IconComponent = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <IconComponent className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-medium text-gray-900">{category.name}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, skills, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {experienceLevels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Licensed Professionals</span>
                    <span className="font-medium">8,247</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available Now</span>
                    <span className="font-medium text-green-600">2,891</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-medium">1.8 hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium text-blue-600">99.1%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'Electrical Systems',
                      'HVAC Design', 
                      'Plumbing',
                      'Project Management',
                      'Interior Design',
                      'Structural Engineering',
                      'Real Estate Development',
                      'Personal Services'
                    ].map(spec => (
                      <div key={spec} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{spec}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 500) + 100}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Standards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>License Verification</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-green-600" />
                    <span>Background Checks</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span>Insurance Verified</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-orange-600" />
                    <span>Skill Assessments</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  Showing {filteredProfessionals.length} of {professionals.length} professionals
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Relevance</option>
                  <option>Rating</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Reviews</option>
                  <option>Response Time</option>
                </select>
              </div>
            </div>

            {/* Professional Cards */}
            <div className="space-y-6">
              {filteredProfessionals.map(professional => {
                const CategoryIcon = getCategoryIcon(professional.category)
                return (
                  <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={professional.avatar} alt={professional.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-medium">
                            {getInitials(professional.name)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Main Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {professional.name}
                                </h3>
                                {professional.verified && (
                                  <Award className="h-5 w-5 text-blue-600" />
                                )}
                                <Badge 
                                  variant={professional.availability === 'Available' ? 'default' : 'secondary'}
                                  className={professional.availability === 'Available' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {professional.availability}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <CategoryIcon className="h-4 w-4 text-gray-600" />
                                <p className="text-lg text-gray-700">{professional.title}</p>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {professional.location}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  ${professional.hourlyRate}/hr
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Responds in {professional.responseTime}
                                </div>
                              </div>
                              {/* License & Certifications */}
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  {professional.license}
                                </Badge>
                                {professional.certifications.map(cert => (
                                  <Badge key={cert} variant="outline" className="text-xs">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Rating and Stats */}
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="font-medium">{professional.rating}</span>
                                <span className="text-gray-600 text-sm">({professional.reviewCount})</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {professional.completedProjects} projects completed
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 mb-4">
                            {professional.description}
                          </p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {professional.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Heart className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                              Last active: 2 hours ago
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg">
                Load More Professionals
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}