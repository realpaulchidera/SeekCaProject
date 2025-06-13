'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Bell, 
  BellOff, 
  Trash2, 
  Edit, 
  Play,
  Calendar,
  Filter
} from 'lucide-react'
import { searchService, SavedSearch } from '@/lib/search'

interface SavedSearchesProps {
  userId: string
  onSearchExecute: (filters: any, searchType: 'jobs' | 'professionals') => void
}

export function SavedSearches({ userId, onSearchExecute }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        const searches = await searchService.getSavedSearches(userId)
        setSavedSearches(searches)
      } catch (error) {
        console.error('Error loading saved searches:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadSavedSearches()
    }
  }, [userId])

  const handleToggleAlert = async (searchId: string, currentStatus: boolean) => {
    try {
      await searchService.updateSavedSearch(searchId, {
        is_alert_enabled: !currentStatus
      })
      
      setSavedSearches(prev => 
        prev.map(search => 
          search.id === searchId 
            ? { ...search, is_alert_enabled: !currentStatus }
            : search
        )
      )
    } catch (error) {
      console.error('Error updating search alert:', error)
    }
  }

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      await searchService.deleteSavedSearch(searchId)
      setSavedSearches(prev => prev.filter(search => search.id !== searchId))
    } catch (error) {
      console.error('Error deleting saved search:', error)
    }
  }

  const handleExecuteSearch = (search: SavedSearch) => {
    onSearchExecute(search.criteria, search.search_type)
  }

  const formatSearchCriteria = (criteria: any, searchType: string) => {
    const parts: string[] = []
    
    if (criteria.query) parts.push(`"${criteria.query}"`)
    if (criteria.location) parts.push(`in ${criteria.location}`)
    if (criteria.category) parts.push(`${criteria.category}`)
    if (criteria.skills && criteria.skills.length > 0) {
      parts.push(`skills: ${criteria.skills.slice(0, 2).join(', ')}${criteria.skills.length > 2 ? '...' : ''}`)
    }
    
    if (searchType === 'jobs') {
      if (criteria.jobType) parts.push(criteria.jobType)
      if (criteria.salaryMin || criteria.salaryMax) {
        const salary = criteria.salaryMin && criteria.salaryMax 
          ? `$${criteria.salaryMin}-${criteria.salaryMax}`
          : criteria.salaryMin 
            ? `$${criteria.salaryMin}+`
            : `up to $${criteria.salaryMax}`
        parts.push(salary)
      }
    } else {
      if (criteria.hourlyRateMin || criteria.hourlyRateMax) {
        const rate = criteria.hourlyRateMin && criteria.hourlyRateMax 
          ? `$${criteria.hourlyRateMin}-${criteria.hourlyRateMax}/hr`
          : criteria.hourlyRateMin 
            ? `$${criteria.hourlyRateMin}+/hr`
            : `up to $${criteria.hourlyRateMax}/hr`
        parts.push(rate)
      }
      if (criteria.availabilityStatus) parts.push(criteria.availabilityStatus)
    }
    
    return parts.join(' • ') || 'All results'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved searches...</p>
        </CardContent>
      </Card>
    )
  }

  if (savedSearches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
          <p className="text-gray-600">
            Save your searches to quickly access them later and get alerts for new results.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {savedSearches.map((search) => (
        <Card key={search.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                  <Badge variant="outline" className="capitalize">
                    {search.search_type}
                  </Badge>
                  {search.is_alert_enabled && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Bell className="w-3 h-3 mr-1" />
                      Alert On
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">
                  {formatSearchCriteria(search.criteria, search.search_type)}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {getTimeAgo(search.created_at)}
                  </div>
                  {search.is_alert_enabled && (
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-1" />
                      {search.alert_frequency} alerts
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExecuteSearch(search)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Search
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleAlert(search.id, search.is_alert_enabled)}
                  className={search.is_alert_enabled ? 'text-green-600' : 'text-gray-400'}
                >
                  {search.is_alert_enabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSearch(search.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}