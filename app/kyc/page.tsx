'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  CreditCard,
  Building,
  Award,
  Camera,
  User,
  Phone,
  MapPin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function KYCVerification() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [taxId, setTaxId] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

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
          
          // If already verified, redirect
          if (profileData.is_verified) {
            router.push('/onboarding')
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

  const verificationSteps = profile?.role === 'professional' ? [
    {
      id: 1,
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      icon: User,
      required: true
    },
    {
      id: 2,
      title: 'Professional Licenses',
      description: 'Upload your professional licenses and certifications',
      icon: Award,
      required: true
    },
    {
      id: 3,
      title: 'Background Check',
      description: 'Consent to background verification',
      icon: Shield,
      required: true
    },
    {
      id: 4,
      title: 'Portfolio Review',
      description: 'Submit work samples for quality review',
      icon: FileText,
      required: false
    }
  ] : [
    {
      id: 1,
      title: 'Business Verification',
      description: 'Verify your business registration',
      icon: Building,
      required: true
    },
    {
      id: 2,
      title: 'Tax Information',
      description: 'Provide business tax identification',
      icon: CreditCard,
      required: true
    },
    {
      id: 3,
      title: 'Business Address',
      description: 'Verify your business address',
      icon: MapPin,
      required: true
    },
    {
      id: 4,
      title: 'Contact Verification',
      description: 'Verify business phone and email',
      icon: Phone,
      required: true
    }
  ]

  const handleSubmitVerification = async () => {
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // In a real implementation, this would:
      // 1. Upload documents to secure storage
      // 2. Submit to verification service (like Jumio, Onfido, etc.)
      // 3. Update verification status in database
      
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update profile verification status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess('Verification documents submitted successfully! We\'ll review your information within 24-48 hours.')
      
      // Redirect after success
      setTimeout(() => {
        router.push('/onboarding')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to submit verification')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile?.role === 'professional' ? 'Professional Verification' : 'Business Verification'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {profile?.role === 'professional' 
              ? 'Complete your verification to build trust with clients and access premium features'
              : 'Verify your business to attract top professionals and build credibility'
            }
          </p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              Complete all required steps to get verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationSteps.map((step, index) => {
                const IconComponent = step.icon
                const isCompleted = index < currentStep - 1
                const isCurrent = index === currentStep - 1
                
                return (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <IconComponent className={`w-5 h-5 ${
                          isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        {step.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Progress value={(currentStep / verificationSteps.length) * 100} className="mt-6" />
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {profile?.role === 'professional' ? (
          <>
            {/* Professional Verification Steps */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>
                    Upload a government-issued photo ID to verify your identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="idType">ID Type</Label>
                      <select
                        id="idType"
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select ID Type</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="passport">Passport</option>
                        <option value="state_id">State ID</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number</Label>
                        <Input
                          id="idNumber"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder="Enter ID number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload ID Document</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                        <Button variant="outline" className="mt-2">
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-blue-600" />
                    Professional Licenses
                  </CardTitle>
                  <CardDescription>
                    Upload your professional licenses and certifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Required Documents</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Professional Engineering (PE) License</li>
                      <li>• Trade licenses (Electrical, Plumbing, etc.)</li>
                      <li>• Professional certifications (PMP, NCIDQ, etc.)</li>
                      <li>• Insurance certificates</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload License Documents
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 10MB each
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-blue-600" />
                    Background Check Consent
                  </CardTitle>
                  <CardDescription>
                    Authorize a background check to build trust with clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900 mb-2">What We Check</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Criminal background verification</li>
                      <li>• Professional license validation</li>
                      <li>• Employment history verification</li>
                      <li>• Education verification (if applicable)</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="backgroundConsent"
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="backgroundConsent" className="text-sm">
                        I authorize SeekCa to conduct a background check as described above. 
                        I understand this information will be used to verify my professional 
                        credentials and build trust with potential clients.
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="dataConsent"
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="dataConsent" className="text-sm">
                        I consent to the collection and processing of my personal data 
                        for verification purposes as outlined in the Privacy Policy.
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Business Verification Steps */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-blue-600" />
                    Business Verification
                  </CardTitle>
                  <CardDescription>
                    Verify your business registration and legal status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Legal Business Name</Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Acme Corporation LLC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <select
                        id="businessType"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Business Type</option>
                        <option value="llc">LLC</option>
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                        <option value="sole_proprietorship">Sole Proprietorship</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Registration Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload Articles of Incorporation or Business License
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 10MB
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-4">
            {currentStep < verificationSteps.length ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next Step
              </Button>
            ) : (
              <Button onClick={handleSubmitVerification} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Verification Timeline</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Document review: 24-48 hours</li>
                  <li>• Background check: 3-5 business days</li>
                  <li>• License verification: 1-2 business days</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Support</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Having trouble with verification?
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}