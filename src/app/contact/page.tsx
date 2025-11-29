'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Send } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { fadeInUpVariants, gridVariants } from '@/lib/animations'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@arvista.art',
    href: 'mailto:hello@arvista.art',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Studio',
    value: 'San Francisco, CA',
    href: null,
  },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Interested in a commission, collaboration, or just want to say hello? I'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                  Send a Message
                </h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Thank you for your message! I'll get back to you soon.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />

                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What's this about?"
                  />

                  <Textarea
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell me about your inquiry..."
                  />

                  <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info & Map */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <info.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600 mb-1">{info.label}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-lg font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-lg font-medium text-neutral-900">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <p className="text-sm font-medium text-neutral-600 mb-4">Follow My Work</p>
                  <div className="flex gap-4">
                    {socialLinks.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-4">
                  Studio Hours
                </h3>
                <div className="space-y-2 text-neutral-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">By Appointment</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-secondary-50 rounded-2xl p-6">
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">Response Time:</span> I typically respond to inquiries within 24-48 hours. For urgent commissions or purchases, please mention "URGENT" in your subject line.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
