'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Briefcase,
  Save,
  Bell
} from 'lucide-react'
import { JobSearchFilters, ProfessionalSearchFilters, searchService } from '@/lib/search'

interface AdvancedSearchProps {
  searchType: 'jobs' | 'professionals'
  initialFilters?: JobSearchFilters | ProfessionalSearchFilters
  onSearch: (filters: any) => void
  onSaveSearch?: (name: string, filters: any, enableAlert: boolean) => void
  className?: string
}

export function AdvancedSearch({ 
  searchType, 
  initialFilters = {}, 
  onSearch, 
  onSaveSearch,
  className = '' 
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [enableAlert, setEnableAlert] = useState(false)

  const jobCategories = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'construction', name: 'Construction & Trades' },
    { id: 'real-estate', name: 'Real Estate' },
    { id: 'project-management', name: 'Project Management' },
    { id: 'design', name: 'Design & Architecture' },
    { id: 'services', name: 'Personal Services' },
    { id: 'consulting', name: 'Professional Consulting' },
    { id: 'other', name: 'Other' }
  ]

  const jobTypes = [
    { id: 'full-time', name: 'Full-time' },
    { id: 'part-time', name: 'Part-time' },
    { id: 'contract', name: 'Contract' },
    { id: 'freelance', name: 'Freelance' }
  ]

  const salaryTypes = [
    { id: 'hourly', name: 'Hourly' },
    { id: 'salary', name: 'Annual Salary' },
    { id: 'project', name: 'Project-based' }
  ]

  const availabilityStatuses = [
    { id: 'available', name: 'Available' },
    { id: 'busy', name: 'Busy' },
    { id: 'unavailable', name: 'Unavailable' }
  ]

  const postedWithinOptions = [
    { id: 1, name: 'Last 24 hours' },
    { id: 3, name: 'Last 3 days' },
    { id: 7, name: 'Last week' },
    { id: 30, name: 'Last month' }
  ]

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSkillAdd = (skill: string) => {
    const currentSkills = (filters as any).skills || (filters as any).requiredSkills || []
    const skillKey = searchType === 'jobs' ? 'requiredSkills' : 'skills'
    
    if (!currentSkills.includes(skill)) {
      handleFilterChange(skillKey, [...currentSkills, skill])
    }
  }

  const handleSkillRemove = (skill: string) => {
    const skillKey = searchType === 'jobs' ? 'requiredSkills' : 'skills'
    const currentSkills = (filters as any)[skillKey] || []
    handleFilterChange(skillKey, currentSkills.filter((s: string) => s !== skill))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleSaveSearch = () => {
    if (onSaveSearch && searchName.trim()) {
      onSaveSearch(searchName.trim(), filters, enableAlert)
      setShowSaveDialog(false)
      setSearchName('')
      setEnableAlert(false)
    }
  }

  const clearFilters = () => {
    setFilters({})
    onSearch({})
  }

  const getSkillSuggestions = async (query: string) => {
    if (query.length > 1) {
      const suggestions = await searchService.getSkillSuggestions(query)
      setSkillSuggestions(suggestions)
    } else {
      setSkillSuggestions([])
    }
  }

  const getLocationSuggestions = async (query: string) => {
    if (query.length > 1) {
      const suggestions = await searchService.getLocationSuggestions(query)
      setLocationSuggestions(suggestions)
    } else {
      setLocationSuggestions([])
    }
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== '' && 
    (!Array.isArray(value) || value.length > 0)
  ).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder={searchType === 'jobs' ? 'Search jobs, companies, skills...' : 'Search professionals, skills, specializations...'}
            value={(filters as any).query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                <CardDescription>
                  Refine your search with specific criteria
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {onSaveSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Search
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {searchType === 'jobs' ? (
              <>
                {/* Job-specific filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={(filters as JobSearchFilters).category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {jobCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <select
                      value={(filters as JobSearchFilters).jobType || ''}
                      onChange={(e) => handleFilterChange('jobType', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {jobTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Posted Within</Label>
                    <select
                      value={(filters as JobSearchFilters).postedWithinDays || ''}
                      onChange={(e) => handleFilterChange('postedWithinDays', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any time</option>
                      {postedWithinOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="space-y-4">
                  <Label>Salary Range</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={(filters as JobSearchFilters).salaryType || ''}
                      onChange={(e) => handleFilterChange('salaryType', e.target.value || undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any type</option>
                      {salaryTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="number"
                        placeholder="Min"
                        value={(filters as JobSearchFilters).salaryMin || ''}
                        onChange={(e) => handleFilterChange('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={(filters as JobSearchFilters).salaryMax || ''}
                        onChange={(e) => handleFilterChange('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Options */}
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remote"
                        checked={(filters as JobSearchFilters).remoteAllowed || false}
                        onCheckedChange={(checked) => handleFilterChange('remoteAllowed', checked || undefined)}
                      />
                      <Label htmlFor="remote">Remote work allowed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="urgent"
                        checked={(filters as JobSearchFilters).isUrgent || false}
                        onCheckedChange={(checked) => handleFilterChange('isUrgent', checked || undefined)}
                      />
                      <Label htmlFor="urgent">Urgent hiring</Label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Professional-specific filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <select
                      value={(filters as ProfessionalSearchFilters).availabilityStatus || ''}
                      onChange={(e) => handleFilterChange('availabilityStatus', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any availability</option>
                      {availabilityStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Experience (years)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={(filters as ProfessionalSearchFilters).experienceMin || ''}
                      onChange={(e) => handleFilterChange('experienceMin', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Rating</Label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0.0"
                        value={(filters as ProfessionalSearchFilters).ratingMin || ''}
                        onChange={(e) => handleFilterChange('ratingMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Hourly Rate Range */}
                <div className="space-y-4">
                  <Label>Hourly Rate Range</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="number"
                        placeholder="Min rate"
                        value={(filters as ProfessionalSearchFilters).hourlyRateMin || ''}
                        onChange={(e) => handleFilterChange('hourlyRateMin', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="number"
                        placeholder="Max rate"
                        value={(filters as ProfessionalSearchFilters).hourlyRateMax || ''}
                        onChange={(e) => handleFilterChange('hourlyRateMax', e.target.value ? Number(e.target.value) : undefined)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="City, state, or country"
                  value={(filters as any).location || ''}
                  onChange={(e) => {
                    handleFilterChange('location', e.target.value || undefined)
                    getLocationSuggestions(e.target.value)
                  }}
                  className="pl-10"
                />
                {locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleFilterChange('location', location)
                          setLocationSuggestions([])
                        }}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>
                {searchType === 'jobs' ? 'Required Skills' : 'Skills'}
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Type a skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const skill = e.currentTarget.value.trim()
                        if (skill) {
                          handleSkillAdd(skill)
                          e.currentTarget.value = ''
                          setSkillSuggestions([])
                        }
                      }
                    }}
                    onChange={(e) => getSkillSuggestions(e.target.value)}
                  />
                  {skillSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                      {skillSuggestions.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleSkillAdd(skill)
                            setSkillSuggestions([])
                          }}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {((filters as any).skills || (filters as any).requiredSkills || []).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleSkillRemove(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Save Search</CardTitle>
            <CardDescription>
              Save this search and get notified when new matches are found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Search Name</Label>
              <Input
                id="searchName"
                placeholder="e.g., Senior React Developer in SF"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableAlert"
                checked={enableAlert}
                onCheckedChange={setEnableAlert}
              />
              <Label htmlFor="enableAlert" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Enable job alerts for this search
              </Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
              >
                Save Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}