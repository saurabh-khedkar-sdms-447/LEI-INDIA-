'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing. Please check your email and try again.')
      return
    }

    // Verify the email
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/users/verify-email?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
        } else {
          if (data.error?.includes('expired')) {
            setStatus('expired')
            setMessage('This verification link has expired. Please request a new one.')
          } else {
            setStatus('error')
            setMessage(data.error || 'Failed to verify email. Please try again.')
          }
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred while verifying your email. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email address to resend the verification link.')
      return
    }

    try {
      const response = await fetch('/api/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage('Verification link has been sent to your email. Please check your inbox.')
      } else {
        setMessage(data.error || 'Failed to resend verification email.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              {status === 'loading' && (
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              )}
              {(status === 'error' || status === 'expired') && (
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
              <CardTitle className="text-2xl font-bold">
                {status === 'loading' && 'Verifying Email...'}
                {status === 'success' && 'Email Verified!'}
                {(status === 'error' || status === 'expired') && 'Verification Failed'}
              </CardTitle>
              <CardDescription>
                {status === 'loading' && 'Please wait while we verify your email address'}
                {status === 'success' && 'Your email has been successfully verified'}
                {status === 'error' && 'We encountered an issue verifying your email'}
                {status === 'expired' && 'This verification link has expired'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">{message}</p>

              {status === 'success' && (
                <div className="space-y-3">
                  <Button onClick={() => router.push('/login')} className="w-full">
                    Continue to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              )}

              {(status === 'error' || status === 'expired') && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@company.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button onClick={handleResend} className="w-full">
                    Resend Verification Email
                  </Button>
                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-center text-sm text-gray-500">
                  This may take a few seconds...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
