'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, CheckCircle } from 'lucide-react'
import { reviewService, Review } from '@/lib/reviews'

interface ReviewFormProps {
  jobId: string
  revieweeId: string
  reviewerId: string
  revieweeName: string
  jobTitle: string
  onSubmit?: (review: Review) => void
  onCancel?: () => void
}

export function ReviewForm({
  jobId,
  revieweeId,
  reviewerId,
  revieweeName,
  jobTitle,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [skillsRating, setSkillsRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [timelinessRating, setTimelinessRating] = useState(0)
  const [professionalismRating, setProfessionalismRating] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (rating: number) => void
    label: string 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please provide an overall rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a review comment')
      return
    }

    setSubmitting(true)

    try {
      const reviewData = {
        job_id: jobId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        skills_rating: skillsRating || null,
        communication_rating: communicationRating || null,
        timeliness_rating: timelinessRating || null,
        professionalism_rating: professionalismRating || null,
        would_recommend: wouldRecommend,
        is_public: isPublic
      }

      const review = await reviewService.createReview(reviewData)
      
      if (onSubmit) {
        onSubmit(review)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience working with {revieweeName} on "{jobTitle}"
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating *"
          />

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Summarize your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your experience working with this professional. What went well? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detailed Ratings (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StarRating
                value={skillsRating}
                onChange={setSkillsRating}
                label="Technical Skills"
              />
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
                label="Communication"
              />
              <StarRating
                value={timelinessRating}
                onChange={setTimelinessRating}
                label="Timeliness"
              />
              <StarRating
                value={professionalismRating}
                onChange={setProfessionalismRating}
                label="Professionalism"
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-3">
            <Label>Would you recommend this professional?</Label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  wouldRecommend 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Yes, I recommend</span>
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  !wouldRecommend 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <span>No, I don't recommend</span>
              </button>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="isPublic" className="text-sm">
              Make this review public (recommended)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting || rating === 0 || !comment.trim()}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}