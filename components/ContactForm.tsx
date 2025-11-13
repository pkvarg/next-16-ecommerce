'use client'

import { useState, useEffect } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [responseMessage, setResponseMessage] = useState('')

  // Anti-spam: Time-based validation
  const [formStartTime, setFormStartTime] = useState<number>(0)

  // Anti-spam: Honeypot field
  const [honeypot, setHoneypot] = useState('')

  // Anti-spam: Hidden pre-filled fields (legacy honeypot)
  const x = process.env.NEXT_PUBLIC_EMAIL_EXTRA_ONE
  const y = process.env.NEXT_PUBLIC_EMAIL_EXTRA_TWO
  const [passwordGroupOne, setPasswordGroupOne] = useState(x)
  const [passwordGroupTwo, setPasswordGroupTwo] = useState(y)

  // Initialize form start time on mount
  useEffect(() => {
    setFormStartTime(Date.now())
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Anti-spam: Content validation function
  const isSpamContent = (text: string): boolean => {
    if (!text || text.trim().length < 3) return true

    // Check for excessive special characters (more than 40% of content)
    const specialChars = text.match(/[^a-zA-Z0-9\s]/g) || []
    if (specialChars.length / text.length > 0.4) return true

    // Check for random character patterns (less than 20% vowels)
    const vowels = text.match(/[aeiouAEIOUáéíóúýäëïöüÁÉÍÓÚÝ]/g) || []
    if (vowels.length / text.length < 0.2) return true

    // Check for excessive vowels (more than 60% vowels - like "oooooo")
    if (vowels.length / text.length > 0.6) return true

    // Check for excessive uppercase (more than 50% uppercase letters)
    const uppercase = text.match(/[A-Z]/g) || []
    const letters = text.match(/[a-zA-Z]/g) || []
    if (letters && letters.length > 0 && uppercase.length / letters.length > 0.5) return true

    // Check for repetitive characters (same char 3+ times in a row)
    if (/(.)\1{2,}/.test(text)) return true

    // Check for lack of spaces (real messages have spaces between words)
    const words = text.trim().split(/\s+/)
    if (text.length > 20 && words.length < 3) return true

    // Check for repetitive patterns (same 2-3 char sequence repeating)
    if (/(.{2,3})\1{3,}/.test(text)) return true

    return false
  }

  // Anti-spam: Rate limiting (client-side)
  const checkRateLimit = (): boolean => {
    const storageKey = 'contact_form_submissions'
    const now = Date.now()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    const maxSubmissions = 3

    try {
      const stored = localStorage.getItem(storageKey)
      const submissions: number[] = stored ? JSON.parse(stored) : []

      // Filter out submissions older than 1 hour
      const recentSubmissions = submissions.filter((time) => now - time < oneHour)

      if (recentSubmissions.length >= maxSubmissions) {
        return false // Rate limit exceeded
      }

      // Add current submission and save
      recentSubmissions.push(now)
      localStorage.setItem(storageKey, JSON.stringify(recentSubmissions))
      return true
    } catch (error) {
      // If localStorage is not available, allow submission
      console.error('Rate limit check error:', error)
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setResponseMessage('')

    // Anti-spam Check 1: Honeypot field
    if (honeypot !== '') {
      setStatus('error')
      setResponseMessage('Failed to send message. Please try again.')
      setFormData({ name: '', email: '', phone: '', message: '' })
      setHoneypot('')
      return
    }

    // Anti-spam Check 2: Time-based validation (minimum 3 seconds)
    const timeSpent = Date.now() - formStartTime
    if (timeSpent < 3000) {
      setStatus('error')
      setResponseMessage('Please take your time filling out the form.')
      return
    }

    // Anti-spam Check 3: Content validation
    if (isSpamContent(formData.name) || isSpamContent(formData.message)) {
      setStatus('error')
      setResponseMessage('Invalid content detected. Please provide valid information.')
      setFormData({ name: '', email: '', phone: '', message: '' })
      return
    }

    // Anti-spam Check 3b: Email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailPattern.test(formData.email)) {
      setStatus('error')
      setResponseMessage('Please provide a valid email address.')
      return
    }

    // Check for obviously fake email patterns - check both local and domain parts
    const emailParts = formData.email.split('@')
    const emailLocalPart = emailParts[0]
    const emailDomain = emailParts[1] || ''

    // Check local part for repetition
    if (emailLocalPart.length < 2 || /(.)\1{2,}/.test(emailLocalPart)) {
      setStatus('error')
      setResponseMessage('Please provide a valid email address.')
      return
    }

    // Check domain part for repetitive patterns (like "klklkl")
    if (/(.{2,3})\1{2,}/.test(emailDomain)) {
      setStatus('error')
      setResponseMessage('Please provide a valid email address.')
      return
    }

    // Anti-spam Check 3c: Phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '') // Remove non-digits
    if (phoneDigits.length > 0) {
      // Check for repetitive digits (same digit 5+ times)
      if (/(\d)\1{4,}/.test(phoneDigits)) {
        setStatus('error')
        setResponseMessage('Please provide a valid phone number.')
        return
      }
      // Check if phone is too short (minimum 7 digits)
      if (phoneDigits.length < 7) {
        setStatus('error')
        setResponseMessage('Please provide a valid phone number.')
        return
      }
    }

    // Anti-spam Check 4: Rate limiting
    if (!checkRateLimit()) {
      setStatus('error')
      setResponseMessage('Too many submissions. Please try again later.')
      return
    }

    // Anti-spam Check 5: Hidden pre-filled fields (legacy honeypot)
    if (passwordGroupOne !== x || passwordGroupTwo !== y) {
      setStatus('error')
      setResponseMessage('Failed to send message. Please try again.')
      setFormData({ name: '', email: '', phone: '', message: '' })
      setHoneypot('')
      setPasswordGroupOne(x)
      setPasswordGroupTwo(y)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setResponseMessage('Thank you! Your message has been sent successfully.')
        setFormData({ name: '', email: '', phone: '', message: '' })
        setHoneypot('')
        // Reset form start time for next submission
        setFormStartTime(Date.now())
      } else {
        setStatus('error')
        setResponseMessage(data.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setResponseMessage('An error occurred. Please try again later.')
    } finally {
      setStatus((prev) => (prev === 'loading' ? 'idle' : prev))
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Get In Touch</h2>
        <p className="text-purple-200 text-center mb-8">
          Have a question? We'd love to hear from you.
        </p>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-200 border border-green-500/30">
            {responseMessage}
          </div>
        )}
        {status === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-200 border border-red-500/30">
            {responseMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="John Doe"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="+421 000 123 456"
            />
          </div>

          {/* Anti-spam: Honeypot field - hidden from users, bots will fill it */}
          <div
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
            aria-hidden="true"
          >
            <label htmlFor="website_url">Website</label>
            <input
              type="text"
              id="website_url"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              disabled={status === 'loading'}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
              placeholder="Tell us what's on your mind..."
            />
          </div>

          {/* Anti-spam: Hidden pre-filled validation fields */}
          <input
            className="hidden"
            type="text"
            value={passwordGroupOne}
            onChange={(e) => setPasswordGroupOne(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            className="hidden"
            type="text"
            value={passwordGroupTwo}
            onChange={(e) => setPasswordGroupTwo(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
