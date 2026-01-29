'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KineticText } from './KineticText'
import Link from 'next/link'

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  ctaText?: string
  ctaLink?: string
  displayOrder: number
  active: boolean
}

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${baseUrl}/api/hero-slides`)
        
        if (response.ok) {
          const data = await response.json()
          const activeSlides = Array.isArray(data) 
            ? data.filter((slide: HeroSlide) => slide.active)
            : []
          setSlides(activeSlides)
        }
      } catch (error) {
        console.error('Failed to fetch hero slides:', error)
        // Fallback to empty array if API fails
        setSlides([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || isPaused || slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [prefersReducedMotion, isPaused, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Don't render if loading or no slides
  if (isLoading) {
    return (
      <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </section>
    )
  }

  if (slides.length === 0) {
    return null
  }

  const currentSlideData = slides[currentSlide]
  const imageUrl = currentSlideData.image.startsWith('http') 
    ? currentSlideData.image 
    : `${process.env.NEXT_PUBLIC_API_URL || ''}${currentSlideData.image}`

  return (
    <section
      className="relative h-[600px] md:h-[700px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-3xl">
          <motion.div
            key={currentSlide}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentSlideData.subtitle && (
              <p className="text-primary text-sm font-semibold mb-2 uppercase tracking-wide">
                {currentSlideData.subtitle}
              </p>
            )}
            <KineticText className="text-4xl md:text-6xl font-bold text-white mb-4">
              {currentSlideData.title}
            </KineticText>
            {currentSlideData.description && (
              <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                {currentSlideData.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {currentSlideData.ctaText && currentSlideData.ctaLink && (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href={currentSlideData.ctaLink}>
                    {currentSlideData.ctaText}
                  </Link>
                </Button>
              )}
              {currentSlideData.ctaLink !== '/rfq' && (
                <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Link href="/rfq">
                    Request a Quote
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators & Pause */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {!prefersReducedMotion && (
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="px-3 py-1 rounded-full bg-white/20 text-xs text-white hover:bg-white/30"
              aria-pressed={isPaused}
            >
              {isPaused ? 'Play' : 'Pause'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
