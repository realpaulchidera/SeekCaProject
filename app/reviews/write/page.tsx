'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ReviewForm } from '@/components/ui/review-form'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { reviewService, Review } from '@/lib/reviews'
import Link from 'next/link'

export default function WriteReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [jobData, setJobData] = useState<any>(null)
  const [revieweeData, setRevieweeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const jobId = searchParams.get('job')
  const revieweeId = searchParams.get('reviewee')

  useEffect(() => {
    const checkReviewEligibility = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        if (!jobId || !revieweeId) {
          setError('Missing required parameters')
          setLoading(false)
          return
        }

        // Get job details
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            hirer_id,
            profiles!jobs_hirer_id_fkey(company_name)
          `)
          .eq('id', jobId)
          .single()

        if (jobError || !job) {
          setError('Job not found')
          setLoading(false)
          return
        }

        setJobData(job)

        // Get reviewee details
        const { data: reviewee, error: revieweeError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, company_name, role')
          .eq('id', revieweeId)
          .single()

        if (revieweeError || !reviewee) {
          setError('User not found')
          setLoading(false)
          return
        }

        setRevieweeData(reviewee)

        // Check if user can review
        const canUserReview = await reviewService.canUserReview(user.id, jobId, revieweeId)
        setCanReview(canUserReview)

        if (!canUserReview) {
          setError('You are not eligible to review this user for this job, or you have already submitted a review.')
        }

      } catch (error) {
        console.error('Error checking review eligibility:', error)
        setError('An error occurred while loading the review form')
      } finally {
        setLoading(false)
      }
    }

    checkReviewEligibility()
  }, [jobId, revieweeId, router])

  const handleReviewSubmit = (review: Review) => {
    setSubmitted(true)
  }

  const getRevieweeName = () => {
    if (!revieweeData) return 'User'
    
    if (revieweeData.first_name && revieweeData.last_name) {
      return `${revieweeData.first_name} ${revieweeData.last_name}`
    }
    
    return revieweeData.company_name || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review form...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Review Submitted!</CardTitle>
            <CardDescription>
              Thank you for sharing your experience. Your review helps build trust in our community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your review will be visible on the professional's profile</li>
                  <li>• The professional may respond to your review</li>
                  <li>• Your review helps other clients make informed decisions</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href={`/professionals/${revieweeId}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !canReview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Write Review</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Review Form */}
        <ReviewForm
          jobId={jobId!}
          revieweeId={revieweeId!}
          reviewerId={user.id}
          revieweeName={getRevieweeName()}
          jobTitle={jobData?.title || 'Project'}
          onSubmit={handleReviewSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  )
}