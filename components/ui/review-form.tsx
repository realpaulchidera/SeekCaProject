'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, Send, X } from 'lucide-react'
import { reviewService, Review } from '@/lib/reviews'

interface ReviewFormProps {
  jobId: string
  revieweeId: string
  reviewerId: string
  revieweeName: string
  jobTitle: string
  onSubmit: (review: Review) => void
  onCancel: () => void
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

  const [hoverRating, setHoverRating] = useState(0)
  const [hoverSkills, setHoverSkills] = useState(0)
  const [hoverCommunication, setHoverCommunication] = useState(0)
  const [hoverTimeliness, setHoverTimeliness] = useState(0)
  const [hoverProfessionalism, setHoverProfessionalism] = useState(0)

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
        title: title.trim() || undefined,
        comment: comment.trim(),
        skills_rating: skillsRating || undefined,
        communication_rating: communicationRating || undefined,
        timeliness_rating: timelinessRating || undefined,
        professionalism_rating: professionalismRating || undefined,
        would_recommend: wouldRecommend,
        is_public: isPublic
      }

      const review = await reviewService.createReview(reviewData)
      onSubmit(review)
    } catch (error: any) {
      setError(error.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ 
    value, 
    onChange, 
    hover, 
    onHover, 
    onLeave 
  }: { 
    value: number
    onChange: (rating: number) => void
    hover: number
    onHover: (rating: number) => void
    onLeave: () => void
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            star <= (hover || value) 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
        />
      ))}
    </div>
  )

  return (
    <Card className="max-w-2xl mx-auto">
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
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Overall Rating *
            </Label>
            <div className="flex items-center space-x-3">
              <StarRating
                value={rating}
                onChange={setRating}
                hover={hoverRating}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(0)}
              />
              <span className="text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? 's' : ''}
                    {rating === 5 && ' - Excellent!'}
                    {rating === 4 && ' - Very Good'}
                    {rating === 3 && ' - Good'}
                    {rating === 2 && ' - Fair'}
                    {rating === 1 && ' - Poor'}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <textarea
              id="comment"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience working with this professional..."
              required
            />
            <p className="text-xs text-gray-500">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detailed Ratings (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skills & Expertise</Label>
                <StarRating
                  value={skillsRating}
                  onChange={setSkillsRating}
                  hover={hoverSkills}
                  onHover={setHoverSkills}
                  onLeave={() => setHoverSkills(0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Communication</Label>
                <StarRating
                  value={communicationRating}
                  onChange={setCommunicationRating}
                  hover={hoverCommunication}
                  onHover={setHoverCommunication}
                  onLeave={() => setHoverCommunication(0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Timeliness</Label>
                <StarRating
                  value={timelinessRating}
                  onChange={setTimelinessRating}
                  hover={hoverTimeliness}
                  onHover={setHoverTimeliness}
                  onLeave={() => setHoverTimeliness(0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Professionalism</Label>
                <StarRating
                  value={professionalismRating}
                  onChange={setProfessionalismRating}
                  hover={hoverProfessionalism}
                  onHover={setHoverProfessionalism}
                  onLeave={() => setHoverProfessionalism(0)}
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommend"
                checked={wouldRecommend}
                onCheckedChange={setWouldRecommend}
              />
              <Label htmlFor="recommend">
                I would recommend this professional to others
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">
                Make this review public (visible to other users)
              </Label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || rating === 0 || !comment.trim()}
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}