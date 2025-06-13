'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { JobSearchFilters, ProfessionalSearchFilters } from '@/lib/search'

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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedSearchName, setSavedSearchName] = useState('')
  const [enableAlert, setEnableAlert] = useState(false)

  // Job-specific filters
  const [category, setCategory] = useState((initialFilters as JobSearchFilters).category || '')
  const [jobType, setJobType] = useState((initialFilters as JobSearchFilters).jobType || '')
  const [location, setLocation] = useState(initialFilters.location || '')
  const [remoteAllowed, setRemoteAllowed] = useState((initialFilters as JobSearchFilters).remoteAllowed || false)
  const [salaryMin, setSalaryMin] = useState((initialFilters as JobSearchFilters).salaryMin?.toString() || '')
  const [salaryMax, setSalaryMax] = useState((initialFilters as JobSearchFilters).salaryMax?.toString() || '')
  const [salaryType, setSalaryType] = useState((initialFilters as JobSearchFilters).salaryType || '')
  const [isUrgent, setIsUrgent] = useState((initialFilters as JobSearchFilters).isUrgent || false)
  const [postedWithinDays, setPostedWithinDays] = useState((initialFilters as JobSearchFilters).postedWithinDays?.toString() || '')

  // Professional-specific filters
  const [hourlyRateMin, setHourlyRateMin] = useState((initialFilters as ProfessionalSearchFilters).hourlyRateMin?.toString() || '')
  const [hourlyRateMax, setHourlyRateMax] = useState((initialFilters as ProfessionalSearchFilters).hourlyRateMax?.toString() || '')
  const [availabilityStatus, setAvailabilityStatus] = useState((initialFilters as ProfessionalSearchFilters).availabilityStatus || '')
  const [experienceMin, setExperienceMin] = useState((initialFilters as ProfessionalSearchFilters).experienceMin?.toString() || '')
  const [ratingMin, setRatingMin] = useState((initialFilters as ProfessionalSearchFilters).ratingMin?.toString() || '')

  // Common filters
  const [skills, setSkills] = useState<string[]>(
    (initialFilters as any).skills || (initialFilters as any).requiredSkills || []
  )
  const [licenses, setLicenses] = useState<string[]>(
    (initialFilters as any).licenses || (initialFilters as any).requiredLicenses || []
  )
  const [skillInput, setSkillInput] = useState('')
  const [licenseInput, setLicenseInput] = useState('')

  const categories = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'construction', label: 'Construction & Trades' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'design', label: 'Design & Architecture' },
    { value: 'services', label: 'Personal Services' },
    { value: 'consulting', label: 'Professional Consulting' },
    { value: 'other', label: 'Other' }
  ]

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ]

  const salaryTypes = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'salary', label: 'Annual Salary' },
    { value: 'project', label: 'Project-based' }
  ]

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'unavailable', label: 'Unavailable' }
  ]

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const addLicense = () => {
    if (licenseInput.trim() && !licenses.includes(licenseInput.trim())) {
      setLicenses([...licenses, licenseInput.trim()])
      setLicenseInput('')
    }
  }

  const removeLicense = (license: string) => {
    setLicenses(licenses.filter(l => l !== license))
  }

  const handleSearch = () => {
    const baseFilters = {
      query: query.trim() || undefined,
      location: location.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      licenses: licenses.length > 0 ? licenses : undefined
    }

    if (searchType === 'jobs') {
      const jobFilters: JobSearchFilters = {
        ...baseFilters,
        category: category || undefined,
        jobType: jobType || undefined,
        remoteAllowed: remoteAllowed || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        salaryType: salaryType || undefined,
        requiredSkills: skills.length > 0 ? skills : undefined,
        requiredLicenses: licenses.length > 0 ? licenses : undefined,
        isUrgent: isUrgent || undefined,
        postedWithinDays: postedWithinDays ? Number(postedWithinDays) : undefined
      }
      onSearch(jobFilters)
    } else {
      const professionalFilters: ProfessionalSearchFilters = {
        ...baseFilters,
        hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
        hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
        availabilityStatus: availabilityStatus || undefined,
        experienceMin: experienceMin ? Number(experienceMin) : undefined,
        ratingMin: ratingMin ? Number(ratingMin) : undefined
      }
      onSearch(professionalFilters)
    }
  }

  const handleSaveSearch = () => {
    if (!onSaveSearch || !savedSearchName.trim()) return

    const filters = searchType === 'jobs' ? {
      query: query.trim() || undefined,
      category: category || undefined,
      jobType: jobType || undefined,
      location: location.trim() || undefined,
      remoteAllowed: remoteAllowed || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryType: salaryType || undefined,
      requiredSkills: skills.length > 0 ? skills : undefined,
      requiredLicenses: licenses.length > 0 ? licenses : undefined,
      isUrgent: isUrgent || undefined,
      postedWithinDays: postedWithinDays ? Number(postedWithinDays) : undefined
    } : {
      query: query.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      location: location.trim() || undefined,
      hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
      hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
      availabilityStatus: availabilityStatus || undefined,
      experienceMin: experienceMin ? Number(experienceMin) : undefined,
      ratingMin: ratingMin ? Number(ratingMin) : undefined,
      licenses: licenses.length > 0 ? licenses : undefined
    }

    onSaveSearch(savedSearchName.trim(), filters, enableAlert)
    setShowSaveDialog(false)
    setSavedSearchName('')
    setEnableAlert(false)
  }

  const clearFilters = () => {
    setQuery('')
    setCategory('')
    setJobType('')
    setLocation('')
    setRemoteAllowed(false)
    setSalaryMin('')
    setSalaryMax('')
    setSalaryType('')
    setIsUrgent(false)
    setPostedWithinDays('')
    setHourlyRateMin('')
    setHourlyRateMax('')
    setAvailabilityStatus('')
    setExperienceMin('')
    setRatingMin('')
    setSkills([])
    setLicenses([])
    setSkillInput('')
    setLicenseInput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5 text-blue-600" />
          Advanced Search
        </CardTitle>
        <CardDescription>
          Find exactly what you're looking for with detailed filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder={`Search ${searchType}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-lg"
            />
          </div>
          <Button onClick={handleSearch} size="lg">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="lg"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City, State, or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Job-specific filters */}
              {searchType === 'jobs' && (
                <>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {jobTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Type</Label>
                    <Select value={salaryType} onValueChange={setSalaryType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {salaryTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Min Salary
                    </Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Max Salary
                    </Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Posted Within (days)
                    </Label>
                    <Select value={postedWithinDays} onValueChange={setPostedWithinDays}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any time</SelectItem>
                        <SelectItem value="1">Last 24 hours</SelectItem>
                        <SelectItem value="7">Last week</SelectItem>
                        <SelectItem value="30">Last month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Professional-specific filters */}
              {searchType === 'professionals' && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Min Hourly Rate
                    </Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={hourlyRateMin}
                      onChange={(e) => setHourlyRateMin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Max Hourly Rate
                    </Label>
                    <Input
                      type="number"
                      placeholder="200"
                      value={hourlyRateMax}
                      onChange={(e) => setHourlyRateMax(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any availability</SelectItem>
                        {availabilityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Min Experience (years)
                    </Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Min Rating
                    </Label>
                    <Select value={ratingMin} onValueChange={setRatingMin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any rating</SelectItem>
                        <SelectItem value="4">4+ stars</SelectItem>
                        <SelectItem value="4.5">4.5+ stars</SelectItem>
                        <SelectItem value="5">5 stars only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Licenses */}
            <div className="space-y-3">
              <Label className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Licenses/Certifications
              </Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a license..."
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLicense()}
                />
                <Button type="button" onClick={addLicense} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {licenses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {licenses.map((license, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700">
                      <Award className="w-3 h-3" />
                      {license}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeLicense(license)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Job-specific checkboxes */}
            {searchType === 'jobs' && (
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remote" 
                    checked={remoteAllowed}
                    onCheckedChange={setRemoteAllowed}
                  />
                  <Label htmlFor="remote">Remote work allowed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="urgent" 
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                  <Label htmlFor="urgent">Urgent hiring only</Label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <div className="flex space-x-2">
                {onSaveSearch && (
                  <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Search
                  </Button>
                )}
                <Button onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium mb-3">Save This Search</h3>
            <div className="space-y-3">
              <Input
                placeholder="Enter search name..."
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableAlert" 
                  checked={enableAlert}
                  onCheckedChange={setEnableAlert}
                />
                <Label htmlFor="enableAlert">
                  Email me when new {searchType} match this search
                </Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSearch} disabled={!savedSearchName.trim()}>
                  Save Search
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}