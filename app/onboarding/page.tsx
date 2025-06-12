'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  User, 
  Briefcase, 
  Award, 
  FileText,
  Camera,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [professionalProfile, setProfessionalProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)

          // If professional, get professional profile
          if (profileData.role === 'professional') {
            const { data: profData } = await supabase
              .from('professional_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single()

            setProfessionalProfile(profData)
          }
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    if (profile) {
      calculateCompletion()
    }
  }, [profile, professionalProfile])

  const calculateCompletion = () => {
    let completed = 0
    let total = 0

    // Basic profile steps
    const basicSteps = [
      profile?.first_name || profile?.company_name,
      profile?.location,
      profile?.phone,
      profile?.bio,
      profile?.avatar_url
    ]

    total += basicSteps.length
    completed += basicSteps.filter(Boolean).length

    // Professional-specific steps
    if (profile?.role === 'professional') {
      const professionalSteps = [
        professionalProfile?.title,
        professionalProfile?.hourly_rate,
        professionalProfile?.skills?.length > 0,
        professionalProfile?.experience_years,
        professionalProfile?.licenses?.length > 0,
        professionalProfile?.certifications?.length > 0,
        profile?.is_verified
      ]

      total += professionalSteps.length
      completed += professionalSteps.filter(Boolean).length
    } else {
      // Hirer-specific steps
      const hirerSteps = [
        profile?.company_name,
        profile?.website,
        profile?.is_verified
      ]

      total += hirerSteps.length
      completed += hirerSteps.filter(Boolean).length
    }

    const percentage = Math.round((completed / total) * 100)
    setCompletionPercentage(percentage)
  }

  const onboardingSteps = profile?.role === 'professional' ? [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Complete your personal details',
      icon: User,
      completed: !!(profile?.first_name && profile?.last_name && profile?.location && profile?.phone),
      href: '/profile/edit?section=basic'
    },
    {
      id: 'professional-details',
      title: 'Professional Details',
      description: 'Add your title, rate, and experience',
      icon: Briefcase,
      completed: !!(professionalProfile?.title && professionalProfile?.hourly_rate && professionalProfile?.experience_years),
      href: '/profile/edit?section=professional'
    },
    {
      id: 'skills-licenses',
      title: 'Skills & Licenses',
      description: 'List your skills and professional licenses',
      icon: Award,
      completed: !!(professionalProfile?.skills?.length > 0 && professionalProfile?.licenses?.length > 0),
      href: '/profile/edit?section=skills'
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Bio',
      description: 'Showcase your work and write your bio',
      icon: FileText,
      completed: !!(profile?.bio && professionalProfile?.portfolio_url),
      href: '/profile/edit?section=portfolio'
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Upload a professional photo',
      icon: Camera,
      completed: !!profile?.avatar_url,
      href: '/profile/edit?section=photo'
    },
    {
      id: 'verification',
      title: 'Get Verified',
      description: 'Complete KYC verification',
      icon: Shield,
      completed: !!profile?.is_verified,
      href: '/kyc'
    }
  ] : [
    {
      id: 'company-info',
      title: 'Company Information',
      description: 'Complete your company details',
      icon: User,
      completed: !!(profile?.company_name && profile?.location && profile?.phone),
      href: '/profile/edit?section=basic'
    },
    {
      id: 'company-details',
      title: 'Company Details',
      description: 'Add website and company bio',
      icon: Briefcase,
      completed: !!(profile?.website && profile?.bio),
      href: '/profile/edit?section=company'
    },
    {
      id: 'photo',
      title: 'Company Logo',
      description: 'Upload your company logo',
      icon: Camera,
      completed: !!profile?.avatar_url,
      href: '/profile/edit?section=photo'
    },
    {
      id: 'verification',
      title: 'Get Verified',
      description: 'Complete business verification',
      icon: Shield,
      completed: !!profile?.is_verified,
      href: '/kyc'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            {profile?.role === 'professional' 
              ? 'Set up your professional profile to start finding great opportunities'
              : 'Set up your company profile to start hiring top talent'
            }
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Profile Completion</CardTitle>
                <CardDescription>
                  {completionPercentage}% complete - {completionPercentage === 100 ? "You're all set!" : "Keep going to unlock all features"}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
                <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                  {completionPercentage === 100 ? "Complete" : "In Progress"}
                </Badge>
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Onboarding Steps */}
        <div className="space-y-4 mb-8">
          {onboardingSteps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <Card key={step.id} className={`transition-all hover:shadow-md ${step.completed ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {step.title}
                          {step.completed && (
                            <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
                              Complete
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {step.completed ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={step.href}>
                            Edit
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" asChild>
                          <Link href={step.href}>
                            Complete
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Why Complete Your Profile?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile?.role === 'professional' ? (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">More Job Opportunities</h3>
                    <p className="text-sm text-gray-600">Complete profiles get 5x more job invitations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Build Trust</h3>
                    <p className="text-sm text-gray-600">Verified profiles earn 40% higher rates</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Stand Out</h3>
                    <p className="text-sm text-gray-600">Showcase your expertise and credentials</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Attract Top Talent</h3>
                    <p className="text-sm text-gray-600">Complete profiles get 3x more applications</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Build Credibility</h3>
                    <p className="text-sm text-gray-600">Verified companies are trusted by professionals</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Better Matches</h3>
                    <p className="text-sm text-gray-600">Detailed profiles help find the right fit</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={profile?.role === 'professional' ? '/dashboard/professional' : '/dashboard/hirer'}>
              Skip for Now
            </Link>
          </Button>
          {completionPercentage === 100 ? (
            <Button asChild>
              <Link href={profile?.role === 'professional' ? '/jobs' : '/browse'}>
                {profile?.role === 'professional' ? 'Start Finding Jobs' : 'Start Hiring'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={onboardingSteps.find(step => !step.completed)?.href || '/profile/edit'}>
                Continue Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}