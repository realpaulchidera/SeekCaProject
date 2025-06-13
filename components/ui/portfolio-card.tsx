'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink, 
  Calendar, 
  MapPin, 
  DollarSign,
  Star,
  Eye,
  Edit,
  Trash2,
  Award
} from 'lucide-react'
import { PortfolioItem } from '@/lib/reviews'

interface PortfolioCardProps {
  item: PortfolioItem
  showActions?: boolean
  onEdit?: (item: PortfolioItem) => void
  onDelete?: (itemId: string) => void
  className?: string
}

export function PortfolioCard({ 
  item, 
  showActions = true, 
  onEdit, 
  onDelete,
  className 
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
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
      return `${diffMonths} months`
    }
    
    return null
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-0">
        {/* Featured Image */}
        {item.featured_image_url && !imageError && (
          <div className="relative">
            <img
              src={item.featured_image_url}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-lg"
              onError={() => setImageError(true)}
            />
            {item.is_featured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>
              {item.project_type && (
                <Badge variant="outline" className="text-xs">
                  {item.project_type}
                </Badge>
              )}
            </div>
            
            {showActions && (onEdit || onDelete) && (
              <div className="flex items-center space-x-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {item.description}
          </p>

          {/* Project Details */}
          <div className="space-y-2 mb-4">
            {item.client_name && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Client:</span>
                <span className="ml-2">{item.client_name}</span>
              </div>
            )}
            
            {item.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {item.location}
              </div>
            )}
            
            {(item.start_date || item.end_date) && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {item.start_date && formatDate(item.start_date)}
                {item.start_date && item.end_date && ' - '}
                {item.end_date && formatDate(item.end_date)}
                {calculateDuration() && (
                  <span className="ml-2 text-gray-500">
                    ({calculateDuration()})
                  </span>
                )}
              </div>
            )}
            
            {item.project_value && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatCurrency(item.project_value)} project value
              </div>
            )}
          </div>

          {/* Skills Used */}
          {item.skills_used && item.skills_used.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-900 mb-2">Skills Used:</p>
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
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-900 mb-2">Tools & Technologies:</p>
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
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-900 mb-2">Certifications Applied:</p>
              <div className="flex flex-wrap gap-1">
                {item.certifications_applied.map((cert, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                    <Award className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Achieved */}
          {item.results_achieved && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-900 mb-1">Results Achieved:</p>
              <p className="text-sm text-gray-700">
                {item.results_achieved}
              </p>
            </div>
          )}

          {/* Client Testimonial */}
          {item.client_testimonial && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-xs font-medium text-blue-900 mb-1">Client Testimonial:</p>
              <p className="text-sm text-blue-800 italic">
                "{item.client_testimonial}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              {item.document_urls && item.document_urls.length > 0 && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Documents ({item.document_urls.length})
                </Button>
              )}
              
              {item.image_urls && item.image_urls.length > 0 && (
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Gallery ({item.image_urls.length})
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}