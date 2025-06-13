'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  X, 
  Plus,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Award,
  Save
} from 'lucide-react'
import { JobSearchFilters, ProfessionalSearchFilters, searchService } from '@/lib/search'

interface AdvancedSearchProps {
  searchType: 'jobs' | 'professionals'
  initialFilters?: JobSearchFilters | ProfessionalSearchFilters
  onSearch: (filters: any) => void
  onSaveSearch?: (name: string, filters: any, enableAlert: boolean) => void
}

export function AdvancedSearch({ 
  searchType, 
  initialFilters = {}, 
  onSearch, 
  onSaveSearch 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialFilters.query || '')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [enableAlert, setEnableAlert] = useState(false)

  // Job-specific filters
  const [category, setCategory] = useState('')
  const [jobType, setJobType] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryType, setSalaryType] = useState('')
  const [remoteAllowed, setRemoteAllowed] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [postedWithinDays, setPostedWithinDays] = useState('')

  // Professional-specific filters
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState('')
  const [experienceMin, setExperienceMin] = useState('')
  const [ratingMin, setRatingMin] = useState('')

  useEffect(() => {
    // Populate initial filters
    if (searchType === 'jobs') {
      const filters = initialFilters as JobSearchFilters
      setCategory(filters.category || '')
      setJobType(filters.jobType || '')
      setSalaryMin(filters.salaryMin?.toString() || '')
      setSalaryMax(filters.salaryMax?.toString() || '')
      setSalaryType(filters.salaryType || '')
      setRemoteAllowed(filters.remoteAllowed || false)
      setIsUrgent(filters.isUrgent || false)
      setPostedWithinDays(filters.postedWithinDays?.toString() || '')
      setSkills(filters.requiredSkills || [])
    } else {
      const filters = initialFilters as ProfessionalSearchFilters
      setHourlyRateMin(filters.hourlyRateMin?.toString() || '')
      setHourlyRateMax(filters.hourlyRateMax?.toString() || '')
      setAvailabilityStatus(filters.availabilityStatus || '')
      setExperienceMin(filters.experienceMin?.toString() || '')
      setRatingMin(filters.ratingMin?.toString() || '')
      setSkills(filters.skills || [])
    }
    
    setLocation(initialFilters.location || '')
  }, [initialFilters, searchType])

  // Debounced skill suggestions
  useEffect(() => {
    if (newSkill.length > 1) {
      const timer = setTimeout(async () => {
        try {
          const suggestions = await searchService.getSkillSuggestions(newSkill)
          setSkillSuggestions(suggestions.filter(s => !skills.includes(s)))
        } catch (error) {
          console.error('Error fetching skill suggestions:', error)
        }
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setSkillSuggestions([])
    }
  }, [newSkill, skills])

  // Debounced location suggestions
  useEffect(() => {
    if (location.length > 1) {
      const timer = setTimeout(async () => {
        try {
          const suggestions = await searchService.getLocationSuggestions(location)
          setLocationSuggestions(suggestions)
        } catch (error) {
          console.error('Error fetching location suggestions:', error)
        }
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setLocationSuggestions([])
    }
  }, [location])

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
      setNewSkill('')
      setSkillSuggestions([])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSearch = () => {
    if (searchType === 'jobs') {
      const filters: JobSearchFilters = {
        query: query || undefined,
        category: category || undefined,
        jobType: jobType || undefined,
        location: location || undefined,
        remoteAllowed: remoteAllowed || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryType: salaryType || undefined,
        requiredSkills: skills.length > 0 ? skills : undefined,
        isUrgent: isUrgent || undefined,
        postedWithinDays: postedWithinDays ? Number(postedWithinDays) : undefined
      }
      onSearch(filters)
    } else {
      const filters: ProfessionalSearchFilters = {
        query: query || undefined,
        skills: skills.length > 0 ? skills : undefined,
        location: location || undefined,
        hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
        hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
        availabilityStatus: availabilityStatus || undefined,
        experienceMin: experienceMin ? Number(experienceMin) : undefined,
        ratingMin: ratingMin ? Number(ratingMin) : undefined
      }
      onSearch(filters)
    }
  }

  const handleSaveSearch = () => {
    if (!onSaveSearch || !searchName.trim()) return

    const filters = searchType === 'jobs' ? {
      query: query || undefined,
      category: category || undefined,
      jobType: jobType || undefined,
      location: location || undefined,
      remoteAllowed: remoteAllowed || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryType: salaryType || undefined,
      requiredSkills: skills.length > 0 ? skills : undefined,
      isUrgent: isUrgent || undefined,
      postedWithinDays: postedWithinDays ? Number(postedWithinDays) : undefined
    } : {
      query: query || undefined,
      skills: skills.length > 0 ? skills : undefined,
      location: location || undefined,
      hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
      hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
      availabilityStatus: availabilityStatus || undefined,
      experienceMin: experienceMin ? Number(experienceMin) : undefined,
      ratingMin: ratingMin ? Number(ratingMin) : undefined
    }

    onSaveSearch(searchName, filters, enableAlert)
    setShowSaveDialog(false)
    setSearchName('')
    setEnableAlert(false)
  }

  const clearFilters = () => {
    setQuery('')
    setLocation('')
    setSkills([])
    setCategory('')
    setJobType('')
    setSalaryMin('')
    setSalaryMax('')
    setSalaryType('')
    setRemoteAllowed(false)
    setIsUrgent(false)
    setPostedWithinDays('')
    setHourlyRateMin('')
    setHourlyRateMax('')
    setAvailabilityStatus('')
    setExperienceMin('')
    setRatingMin('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-blue-600" />
          Advanced Search
        </CardTitle>
        <CardDescription>
          Use filters to find exactly what you're looking for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Search Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="query"
                  placeholder={searchType === 'jobs' ? 'Job title, company, or keywords' : 'Skills, title, or keywords'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setLocation(suggestion)
                          setLocationSuggestions([])
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="relative">
              <Input
                placeholder="Add skills (e.g., React, Project Management)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill(newSkill)
                  }
                }}
              />
              {newSkill && (
                <Button
                  type="button"
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={() => addSkill(newSkill)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {skillSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {skillSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                      onClick={() => addSkill(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type-specific filters */}
        <Tabs defaultValue="filters" className="w-full">
          <TabsList>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="filters" className="space-y-4">
            {searchType === 'jobs' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="engineering">Engineering</option>
                      <option value="construction">Construction & Trades</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="project-management">Project Management</option>
                      <option value="design">Design & Architecture</option>
                      <option value="services">Personal Services</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <select
                      id="jobType"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">Salary Type</Label>
                    <select
                      id="salaryType"
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="hourly">Hourly</option>
                      <option value="salary">Annual Salary</option>
                      <option value="project">Project-based</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Min"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Max"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postedWithin">Posted Within</Label>
                    <select
                      id="postedWithin"
                      value={postedWithinDays}
                      onChange={(e) => setPostedWithinDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any time</option>
                      <option value="1">Last 24 hours</option>
                      <option value="7">Last week</option>
                      <option value="30">Last month</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={remoteAllowed}
                      onChange={(e) => setRemoteAllowed(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Remote work allowed</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Urgent hiring only</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hourly Rate Range</Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Min"
                          value={hourlyRateMin}
                          onChange={(e) => setHourlyRateMin(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Max"
                          value={hourlyRateMax}
                          onChange={(e) => setHourlyRateMax(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <select
                      id="availability"
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any availability</option>
                      <option value="available">Available now</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Minimum Experience</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="experience"
                        placeholder="Years"
                        value={experienceMin}
                        onChange={(e) => setExperienceMin(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rating">Minimum Rating</Label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        id="rating"
                        value={ratingMin}
                        onChange={(e) => setRatingMin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                      >
                        <option value="">Any rating</option>
                        <option value="4">4+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                        <option value="5">5 stars only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="text-sm text-gray-600">
              Additional filters and sorting options will be available here.
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          
          <div className="flex items-center space-x-3">
            {onSaveSearch && (
              <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                <Save className="w-4 h-4 mr-2" />
                Save Search
              </Button>
            )}
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Save Search</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    placeholder="e.g., React Developer Jobs"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableAlert}
                    onChange={(e) => setEnableAlert(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Email me when new results match this search</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                  Save Search
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}