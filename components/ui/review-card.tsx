'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  CheckCircle,
  X
} from 'lucide-react'
import { ReviewWithDetails } from '@/lib/reviews'
import { reviewService } from '@/lib/reviews'

interface ReviewCardProps {
  review: ReviewWithDetails
  currentUserId?: string
  onVote?: (reviewId: string, isHelpful: boolean) => void
  onRespond?: (reviewId: string) => void
  className?: string
}

export function ReviewCard({ 
  review, 
  currentUserId, 
  onVote, 
  onRespond,
  className = '' 
}: ReviewCardProps) {
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load user's vote on mount
  useState(() => {
    if (currentUserId) {
      reviewService.getUserVote(review.review_id, currentUserId)
        .then(vote => setUserVote(vote))
        .catch(console.error)
    }
  })

  const handleVote = async (isHelpful: boolean) => {
    if (!currentUserId || !onVote) return
    
    try {
      await reviewService.voteHelpful(review.review_id, currentUserId, isHelpful)
      setUserVote(isHelpful)
      onVote(review.review_id, isHelpful)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleSubmitResponse = async () => {
    if (!currentUserId || !responseText.trim()) return
    
    setSubmitting(true)
    try {
      await reviewService.createReviewResponse(review.review_id, currentUserId, responseText)
      setShowResponse(false)
      setResponseText('')
      if (onRespond) onRespond(review.review_id)
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size = 'sm') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
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

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.reviewer_avatar} alt={review.reviewer_name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {review.reviewer_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {review.reviewer_name || 'Anonymous'}
                </h3>
                {review.reviewer_company && (
                  <Badge variant="outline" className="text-xs">
                    {review.reviewer_company}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {renderStars(review.rating)}
                <span className="text-sm font-medium">{review.rating}/5</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(review.created_at)}</span>
                {review.job_title && (
                  <>
                    <span>•</span>
                    <span>Project: {review.job_title}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {review.would_recommend && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Recommends
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Review Title */}
        {review.title && (
          <h4 className="font-medium text-gray-900">{review.title}</h4>
        )}

        {/* Review Comment */}
        {review.comment && (
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        )}

        {/* Category Ratings */}
        {(review.skills_rating || review.communication_rating || 
          review.timeliness_rating || review.professionalism_rating) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {review.skills_rating && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Skills</div>
                {renderStars(review.skills_rating)}
              </div>
            )}
            {review.communication_rating && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Communication</div>
                {renderStars(review.communication_rating)}
              </div>
            )}
            {review.timeliness_rating && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Timeliness</div>
                {renderStars(review.timeliness_rating)}
              </div>
            )}
            {review.professionalism_rating && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Professionalism</div>
                {renderStars(review.professionalism_rating)}
              </div>
            )}
          </div>
        )}

        {/* Professional Response */}
        {review.response_text && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Response from Professional</span>
              <span className="text-xs text-blue-600">
                {formatDate(review.response_created_at!)}
              </span>
            </div>
            <p className="text-blue-800 text-sm">{review.response_text}</p>
          </div>
        )}

        {/* Response Form */}
        {showResponse && (
          <div className="border-t pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Respond to this review
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Thank the reviewer and provide any additional context..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResponse(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim() || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            {/* Helpful Votes */}
            {currentUserId && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Helpful?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  className={`${userVote === true ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  className={`${userVote === false ? 'text-red-600 bg-red-50' : 'text-gray-600'}`}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  No
                </Button>
              </div>
            )}
            
            {review.helpful_count > 0 && (
              <span className="text-sm text-gray-600">
                {review.helpful_count} found this helpful
              </span>
            )}
          </div>

          {/* Response Button */}
          {currentUserId && !review.response_text && onRespond && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResponse(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}