'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Bell, 
  Trash2, 
  Play,
  Clock,
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
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      await searchService.deleteSavedSearch(searchId)
      setSavedSearches(prev => prev.filter(search => search.id !== searchId))
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  const handleExecuteSearch = (search: SavedSearch) => {
    onSearchExecute(search.criteria, search.search_type)
  }

  const formatCriteria = (criteria: any, searchType: string) => {
    const parts: string[] = []
    
    if (criteria.query) parts.push(`"${criteria.query}"`)
    if (criteria.location) parts.push(`📍 ${criteria.location}`)
    if (criteria.category) parts.push(`📂 ${criteria.category}`)
    if (criteria.jobType) parts.push(`💼 ${criteria.jobType}`)
    if (criteria.skills && criteria.skills.length > 0) {
      parts.push(`🔧 ${criteria.skills.slice(0, 2).join(', ')}${criteria.skills.length > 2 ? '...' : ''}`)
    }
    if (criteria.salaryMin || criteria.salaryMax) {
      const min = criteria.salaryMin ? `$${criteria.salaryMin}` : ''
      const max = criteria.salaryMax ? `$${criteria.salaryMax}` : ''
      if (min && max) parts.push(`💰 ${min}-${max}`)
      else if (min) parts.push(`💰 ${min}+`)
      else if (max) parts.push(`💰 up to ${max}`)
    }
    if (criteria.hourlyRateMin || criteria.hourlyRateMax) {
      const min = criteria.hourlyRateMin ? `$${criteria.hourlyRateMin}` : ''
      const max = criteria.hourlyRateMax ? `$${criteria.hourlyRateMax}` : ''
      if (min && max) parts.push(`💰 ${min}-${max}/hr`)
      else if (min) parts.push(`💰 ${min}+/hr`)
      else if (max) parts.push(`💰 up to ${max}/hr`)
    }
    if (criteria.experienceMin) parts.push(`⏱️ ${criteria.experienceMin}+ years`)
    if (criteria.ratingMin) parts.push(`⭐ ${criteria.ratingMin}+ rating`)
    if (criteria.availabilityStatus) parts.push(`🟢 ${criteria.availabilityStatus}`)
    if (criteria.remoteAllowed) parts.push(`🏠 Remote OK`)
    if (criteria.isUrgent) parts.push(`🚨 Urgent`)

    return parts.length > 0 ? parts.join(' • ') : 'No specific criteria'
  }

  const getSearchTypeIcon = (type: string) => {
    return type === 'jobs' ? '💼' : '👥'
  }

  const getAlertFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return 'Immediate'
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      default: return 'Daily'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {savedSearches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Searches</h3>
            <p className="text-gray-600">
              Save your searches to quickly find what you're looking for and get alerts for new matches.
            </p>
          </CardContent>
        </Card>
      ) : (
        savedSearches.map((search) => (
          <Card key={search.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getSearchTypeIcon(search.search_type)}</span>
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
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {formatCriteria(search.criteria, search.search_type)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Created {new Date(search.created_at).toLocaleDateString()}
                    </div>
                    {search.is_alert_enabled && (
                      <div className="flex items-center">
                        <Bell className="w-3 h-3 mr-1" />
                        {getAlertFrequencyText(search.alert_frequency)} alerts
                      </div>
                    )}
                    {search.last_alert_sent && (
                      <div>
                        Last alert: {new Date(search.last_alert_sent).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteSearch(search)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Search
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={search.is_alert_enabled}
                      onCheckedChange={(checked) => handleToggleAlert(search.id, checked)}
                    />
                    <Label className="text-sm">Alerts</Label>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}