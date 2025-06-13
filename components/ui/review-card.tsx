'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Calendar,
  Award,
  CheckCircle
} from 'lucide-react'
import { ReviewWithDetails, reviewService } from '@/lib/reviews'

interface ReviewCardProps {
  review: ReviewWithDetails
  currentUserId?: string
  showJobTitle?: boolean
  className?: string
}

export function ReviewCard({ 
  review, 
  currentUserId, 
  showJobTitle = true,
  className 
}: ReviewCardProps) {
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)
  const [showResponse, setShowResponse] = useState(false)

  const handleVote = async (isHelpful: boolean) => {
    if (!currentUserId) return

    try {
      await reviewService.voteHelpful(review.review_id, currentUserId, isHelpful)
      
      // Update local state
      if (userVote === null) {
        setHelpfulCount(prev => isHelpful ? prev + 1 : prev)
      } else if (userVote !== isHelpful) {
        setHelpfulCount(prev => isHelpful ? prev + 1 : prev - 1)
      }
      
      setUserVote(isHelpful)
    } catch (error) {
      console.error('Error voting on review:', error)
    }
  }

  const renderStars = (rating: number, size = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={review.reviewer_avatar} alt={review.reviewer_name} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(review.reviewer_name || 'Anonymous')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {review.reviewer_name || 'Anonymous'}
                  </h4>
                  {review.reviewer_company && (
                    <span className="text-sm text-gray-600">
                      at {review.reviewer_company}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium">{review.rating}/5</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {showJobTitle && review.job_title && (
                  <p className="text-sm text-blue-600 mb-2">
                    Project: {review.job_title}
                  </p>
                )}
              </div>
            </div>

            {review.would_recommend && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Recommends
              </Badge>
            )}
          </div>

          {/* Review Title */}
          {review.title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {review.title}
            </h3>
          )}

          {/* Review Content */}
          <p className="text-gray-700 leading-relaxed">
            {review.comment}
          </p>

          {/* Detailed Ratings */}
          {(review.skills_rating || review.communication_rating || 
            review.timeliness_rating || review.professionalism_rating) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {review.skills_rating && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Skills</p>
                  {renderStars(review.skills_rating, 'sm')}
                  <p className="text-xs font-medium mt-1">{review.skills_rating}/5</p>
                </div>
              )}
              {review.communication_rating && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Communication</p>
                  {renderStars(review.communication_rating, 'sm')}
                  <p className="text-xs font-medium mt-1">{review.communication_rating}/5</p>
                </div>
              )}
              {review.timeliness_rating && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Timeliness</p>
                  {renderStars(review.timeliness_rating, 'sm')}
                  <p className="text-xs font-medium mt-1">{review.timeliness_rating}/5</p>
                </div>
              )}
              {review.professionalism_rating && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Professionalism</p>
                  {renderStars(review.professionalism_rating, 'sm')}
                  <p className="text-xs font-medium mt-1">{review.professionalism_rating}/5</p>
                </div>
              )}
            </div>
          )}

          {/* Professional Response */}
          {review.response_text && (
            <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Response from Professional
                </span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.response_created_at!)}
                </span>
              </div>
              <p className="text-blue-800 text-sm">
                {review.response_text}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {currentUserId && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(true)}
                    className={`${
                      userVote === true ? 'text-green-600 bg-green-50' : 'text-gray-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(false)}
                    className={`${
                      userVote === false ? 'text-red-600 bg-red-50' : 'text-gray-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Not helpful
                  </Button>
                </div>
              )}
              
              {helpfulCount > 0 && (
                <span className="text-sm text-gray-600">
                  {helpfulCount} found this helpful
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Review #{review.review_id.slice(-8)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}