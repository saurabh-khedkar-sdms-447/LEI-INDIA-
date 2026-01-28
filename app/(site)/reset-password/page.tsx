'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle2, XCircle, Eye, EyeOff, Mail } from 'lucide-react'
import Link from 'next/link'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
type RequestResetFormData = z.infer<typeof requestResetSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    setToken(tokenParam)
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setStatus('error')
      setMessage('Reset token is missing. Please check your email and try again.')
      return
    }

    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/users/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(result.message || 'Password has been reset successfully!')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to reset password. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If no token, show request reset form
  if (!token) {
    return <RequestResetForm />
  }

  return (
    <>
      <Header />
      <main>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              {status === 'success' ? (
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              )}
              <CardTitle className="text-2xl font-bold">
                {status === 'success' ? 'Password Reset!' : 'Reset Your Password'}
              </CardTitle>
              <CardDescription>
                {status === 'success'
                  ? 'Your password has been successfully reset'
                  : 'Enter your new password below'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'success' ? (
                <div className="space-y-4">
                  <p className="text-center text-green-600">{message}</p>
                  <p className="text-center text-sm text-gray-600">
                    Redirecting to login page...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {message && (
                    <div
                      className={`p-3 text-sm rounded-md ${
                        status === 'error'
                          ? 'text-red-600 bg-red-50 border border-red-200'
                          : 'text-blue-600 bg-blue-50 border border-blue-200'
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}

function RequestResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  })

  const onSubmit = async (data: RequestResetFormData) => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/users/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(result.message || 'If an account exists with this email, a password reset link has been sent.')
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to send reset email. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              {status === 'success' ? (
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              )}
              <CardTitle className="text-2xl font-bold">
                {status === 'success' ? 'Check Your Email' : 'Reset Password'}
              </CardTitle>
              <CardDescription>
                {status === 'success'
                  ? 'We sent you a password reset link'
                  : 'Enter your email to receive a password reset link'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'success' ? (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">{message}</p>
                  <p className="text-center text-sm text-gray-500">
                    Please check your email inbox and click the link to reset your password.
                  </p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {message && (
                    <div
                      className={`p-3 text-sm rounded-md ${
                        status === 'error'
                          ? 'text-red-600 bg-red-50 border border-red-200'
                          : 'text-blue-600 bg-blue-50 border border-blue-200'
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your.email@company.com"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
