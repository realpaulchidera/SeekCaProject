'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewCard } from '@/components/ui/review-card'
import { PortfolioCard } from '@/components/ui/portfolio-card'
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Award,
  MessageSquare,
  Heart,
  Share,
  ArrowLeft,
  Briefcase,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { professionalQueries } from '@/lib/database'
import { reviewService, portfolioService, ReviewWithDetails, PortfolioItem, ReviewStatistics } from '@/lib/reviews'
import Link from 'next/link'

export default function ProfessionalProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [professional, setProfessional] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Get professional profile
        const professionalData = await professionalQueries.getProfessionalProfile(params.id)
        setProfessional(professionalData)

        // Get reviews
        const reviewsData = await reviewService.getProfessionalReviews(params.id, 10, 0)
        setReviews(reviewsData)

        // Get review statistics
        const statsData = await reviewService.getReviewStatistics(params.id)
        setReviewStats(statsData)

        // Get portfolio
        const portfolioData = await portfolioService.getProfessionalPortfolio(params.id, 6, 0)
        setPortfolio(portfolioData)

      } catch (error) {
        console.error('Error fetching professional data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const getFullName = () => {
    if (!professional?.profiles) return 'Professional'
    const { first_name, last_name } = professional.profiles
    return `${first_name || ''} ${last_name || ''}`.trim() || 'Professional'
  }

  const getInitials = () => {
    const name = getFullName()
    return name.split(' ').map(n => n[0]).join('')
  }

  const renderStars = (rating: number, showNumber = true) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        {showNumber && (
          <span className="text-sm font-medium ml-2">
            {rating.toFixed(1)} ({reviewStats?.total_reviews || 0})
          </span>
        )}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">The professional profile you're looking for doesn't exist.</p>
            <Link href="/browse">
              <Button>Browse Professionals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start mb-6 lg:mb-0">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={professional.profiles?.avatar_url} alt={getFullName()} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center space-x-2 mb-2">
                  {professional.profiles?.is_verified && (
                    <Award className="h-5 w-5 text-blue-600" />
                  )}
                  <Badge 
                    variant={professional.availability_status === 'available' ? 'default' : 'secondary'}
                    className={professional.availability_status === 'available' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {professional.availability_status === 'available' ? 'Available' : 
                     professional.availability_status === 'busy' ? 'Busy' : 'Unavailable'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 w-full lg:w-auto">
                  {user ? (
                    <>
                      <Button className="w-full lg:w-auto">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full">Sign in to Contact</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{getFullName()}</h1>
                    <p className="text-xl text-gray-700 mb-4">{professional.title || 'Professional'}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {professional.profiles?.location || 'Location not specified'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Responds in {professional.response_time_hours || 24} hours
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {professional.experience_years || 0} years experience
                      </div>
                    </div>

                    {/* Rating */}
                    {reviewStats && reviewStats.total_reviews > 0 && (
                      <div className="mb-4">
                        {renderStars(reviewStats.average_rating)}
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="text-right">
                    {professional.hourly_rate && (
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${professional.hourly_rate}/hr
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      {professional.completed_projects || 0} projects completed
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {professional.profiles?.bio && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {professional.profiles.bio}
                  </p>
                )}

                {/* Skills */}
                {professional.skills && professional.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {professional.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Licenses & Certifications */}
                {professional.licenses && professional.licenses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Licenses & Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {professional.licenses.map((license: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                          <Award className="h-3 w-3 mr-1" />
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professional.completed_projects || 0}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {reviewStats?.average_rating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{reviewStats?.total_reviews || 0}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {reviewStats?.recommendation_percentage?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-gray-600">Recommend</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewStats?.total_reviews || 0})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Featured Portfolio */}
            {portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Work</CardTitle>
                  <CardDescription>
                    Recent projects and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.slice(0, 3).map((item) => (
                      <PortfolioCard
                        key={item.id}
                        item={item}
                        showActions={false}
                        className="h-full"
                      />
                    ))}
                  </div>
                  {portfolio.length > 3 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" onClick={() => setActiveTab('portfolio')}>
                        View All Portfolio Items
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>
                    What clients are saying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.slice(0, 2).map((review) => (
                      <ReviewCard
                        key={review.review_id}
                        review={review}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                  {reviews.length > 2 && (
                    <div className="mt-6 text-center">
                      <Button variant="outline" onClick={() => setActiveTab('reviews')}>
                        View All Reviews
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professional.profiles?.website && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                      <a 
                        href={professional.profiles.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {professional.profiles?.linkedin_url && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                      <a 
                        href={professional.profiles.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {professional.portfolio_url && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                      <a 
                        href={professional.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Portfolio Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(professional.created_at).getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">On-Time Delivery</span>
                    <span className="font-medium">95%</span>
                  </div>
                  {professional.total_earnings && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Earned</span>
                      <span className="font-medium">
                        {formatCurrency(professional.total_earnings)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    className="h-full"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
                  <p className="text-gray-600">
                    This professional hasn't added any portfolio items yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Review Statistics */}
            {reviewStats && reviewStats.total_reviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {reviewStats.average_rating.toFixed(1)}
                      </div>
                      {renderStars(reviewStats.average_rating, false)}
                      <p className="text-gray-600 mt-2">
                        Based on {reviewStats.total_reviews} reviews
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviewStats.rating_distribution[rating.toString() as keyof typeof reviewStats.rating_distribution]
                        const percentage = reviewStats.total_reviews > 0 ? (count / reviewStats.total_reviews) * 100 : 0
                        
                        return (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Category Averages */}
                  {reviewStats.category_averages && (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(reviewStats.category_averages).map(([category, rating]) => (
                        <div key={category} className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {rating.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {category}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.review_id}
                    review={review}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">
                    This professional hasn't received any reviews yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}