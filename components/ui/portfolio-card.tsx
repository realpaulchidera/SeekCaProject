'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye, 
  ExternalLink,
  Star,
  Award,
  Clock,
  User,
  Quote
} from 'lucide-react'
import { PortfolioItem } from '@/lib/reviews'

interface PortfolioCardProps {
  item: PortfolioItem
  onView?: (item: PortfolioItem) => void
  className?: string
  showActions?: boolean
}

export function PortfolioCard({ 
  item, 
  onView, 
  className = '',
  showActions = true 
}: PortfolioCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const calculateDuration = () => {
    if (item.duration_months) {
      return `${item.duration_months} months`
    }
    if (item.start_date && item.end_date) {
      const start = new Date(item.start_date)
      const end = new Date(item.end_date)
      const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
      return `${months} months`
    }
    return null
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Featured Image */}
      {item.featured_image_url && !imageError && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.featured_image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {item.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {item.project_value && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90">
              {formatCurrency(item.project_value)}
            </Badge>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
            {item.project_type && (
              <Badge variant="outline" className="mb-2">
                {item.project_type}
              </Badge>
            )}
          </div>
          {item.is_featured && !item.featured_image_url && (
            <Badge className="bg-yellow-500 text-yellow-900">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <CardDescription className="line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {item.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{item.location}</span>
            </div>
          )}
          
          {calculateDuration() && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{calculateDuration()}</span>
            </div>
          )}
          
          {item.client_name && (
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{item.client_name}</span>
            </div>
          )}
          
          {item.start_date && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {formatDate(item.start_date)}
                {item.end_date && ` - ${formatDate(item.end_date)}`}
              </span>
            </div>
          )}
        </div>

        {/* Skills Used */}
        {item.skills_used && item.skills_used.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Used</h4>
            <div className="flex flex-wrap gap-1">
              {item.skills_used.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {item.skills_used.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{item.skills_used.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tools Used */}
        {item.tools_used && item.tools_used.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tools & Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {item.tools_used.slice(0, 4).map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {item.tools_used.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tools_used.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Certifications Applied */}
        {item.certifications_applied && item.certifications_applied.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications Applied</h4>
            <div className="flex flex-wrap gap-1">
              {item.certifications_applied.map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                  <Award className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Client Testimonial */}
        {item.client_testimonial && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Quote className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 italic">"{item.client_testimonial}"</p>
                {item.client_name && (
                  <p className="text-xs text-gray-500 mt-1">— {item.client_name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Achieved */}
        {item.results_achieved && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Results Achieved</h4>
            <p className="text-sm text-gray-700">{item.results_achieved}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              {item.project_value && (
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(item.project_value)}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={() => onView(item)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
              
              {item.image_urls && item.image_urls.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.image_urls.length - 1} photos
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}