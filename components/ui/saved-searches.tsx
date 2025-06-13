'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Search, 
  Bell, 
  Edit, 
  Trash2, 
  Play,
  Clock,
  Briefcase,
  Users
} from 'lucide-react'
import { SavedSearch, searchService } from '@/lib/search'

interface SavedSearchesProps {
  userId: string
  onSearchExecute: (filters: any, searchType: 'jobs' | 'professionals') => void
  className?: string
}

export function SavedSearches({ userId, onSearchExecute, className = '' }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedSearches()
  }, [userId])

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

  const handleToggleAlert = async (searchId: string, enabled: boolean) => {
    try {
      await searchService.updateSavedSearch(searchId, { is_alert_enabled: enabled })
      setSavedSearches(prev => 
        prev.map(search => 
          search.id === searchId 
            ? { ...search, is_alert_enabled: enabled }
            : search
        )
      )
    } catch (error) {
      console.error('Error updating search alert:', error)
    }
  }

  const handleDeleteSearch = async (searchId: string) => {
    if (confirm('Are you sure you want to delete this saved search?')) {
      try {
        await searchService.deleteSavedSearch(searchId)
        setSavedSearches(prev => prev.filter(search => search.id !== searchId))
      } catch (error) {
        console.error('Error deleting search:', error)
      }
    }
  }

  const handleExecuteSearch = (search: SavedSearch) => {
    onSearchExecute(search.criteria, search.search_type)
  }

  const formatCriteria = (criteria: any, searchType: string) => {
    const parts: string[] = []
    
    if (criteria.query) parts.push(`"${criteria.query}"`)
    if (criteria.category) parts.push(criteria.category)
    if (criteria.location) parts.push(criteria.location)
    if (searchType === 'jobs') {
      if (criteria.jobType) parts.push(criteria.jobType)
      if (criteria.salaryMin || criteria.salaryMax) {
        const salary = `$${criteria.salaryMin || '0'}-${criteria.salaryMax || '∞'}`
        parts.push(salary)
      }
    } else {
      if (criteria.hourlyRateMin || criteria.hourlyRateMax) {
        const rate = `$${criteria.hourlyRateMin || '0'}-${criteria.hourlyRateMax || '∞'}/hr`
        parts.push(rate)
      }
    }
    
    return parts.join(' • ')
  }

  const getSearchIcon = (searchType: string) => {
    return searchType === 'jobs' ? Briefcase : Users
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (savedSearches.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
          <p className="text-gray-600">
            Save your searches to quickly find new opportunities and get alerts when new matches are found.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {savedSearches.map((search) => {
        const IconComponent = getSearchIcon(search.search_type)
        
        return (
          <Card key={search.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{search.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {search.search_type}
                    </Badge>
                    {search.is_alert_enabled && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <Bell className="w-3 h-3 mr-1" />
                        Alert On
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {formatCriteria(search.criteria, search.search_type)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Created {new Date(search.created_at).toLocaleDateString()}
                    </div>
                    {search.last_alert_sent && (
                      <div className="flex items-center">
                        <Bell className="w-3 h-3 mr-1" />
                        Last alert {new Date(search.last_alert_sent).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExecuteSearch(search)}
                    title="Run search"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={search.is_alert_enabled}
                      onCheckedChange={(checked) => handleToggleAlert(search.id, checked)}
                      title="Toggle alerts"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                    title="Delete search"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}