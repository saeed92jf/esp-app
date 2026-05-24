// app/HomeClient.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowRight, faStar, faUsers, faBuilding, faHeadset,
  faChevronRight, faCheckCircle, faEnvelope, faRocket,
  faTachometerAlt, faCalendarAlt, faClock, faFolder, faFileInvoice, faChartLine, faUserCheck,
  faChartSimple, faUserGroup, faMoneyBill, faBriefcase,
  faCrown, faWrench, faUserAlt,
  faPlay
} from '@fortawesome/free-solid-svg-icons'
import { Button, EmailInput, CountUp, SearchInput, Tabs } from '@/components/ui'
import { Logo } from '@/components/ui'
import { FeatureCard } from '@/components/ui'
import { QuickCard } from '@/components/ui'
import { StatsCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import { searchData, type SearchResult } from '@/data/search-data'
import { useRouter } from 'next/navigation'
import { faViadeo } from '@fortawesome/free-brands-svg-icons'

// ============================================
// HOME CLIENT COMPONENT
// Landing page with hero section, stats, features, and newsletter
// Fully responsive with scroll animations
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function HomeClient() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('all')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [revealedSections, setRevealedSections] = useState<string[]>([])
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })
  
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

  const featureTabs = [
    { id: 'all', label: 'All Features', icon: faChartSimple },
    { id: 'crm', label: 'CRM', icon: faUserGroup },
    { id: 'project', label: 'Projects', icon: faFolder },
    { id: 'finance', label: 'Finance', icon: faMoneyBill },
    { id: 'hr', label: 'HR', icon: faBriefcase },
  ]

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN': return faCrown
      case 'ENGINEER': return faWrench
      case 'EMPLOYEE': return faBriefcase
      default: return faUserAlt
    }
  }

  const getRoleIconColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'text-yellow-500' 
      case 'ENGINEER': return 'text-blue-500'
      case 'EMPLOYEE': return 'text-green-500'
      default: return 'text-primary'
    }
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'ENGINEER': return 'Engineer'
      case 'EMPLOYEE': return 'Employee'
      default: return 'Guest User'
    }
  }

  // Handle search result selection
  const handleResultSelect = (result: SearchResult) => {
    console.log('Selected result:', result)
    router.push(result.url)
  }

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            setRevealedSections(prev => [...prev, id])
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionsRef.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const updateUnderlinePosition = useCallback(() => {
    const activeTabElement = tabsRef.current[getTabIndex(activeTab)]
    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      setUnderlineStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeTab])

  useEffect(() => {
    updateUnderlinePosition()
  }, [activeTab, updateUnderlinePosition])

  useEffect(() => {
    window.addEventListener('resize', updateUnderlinePosition)
    return () => window.removeEventListener('resize', updateUnderlinePosition)
  }, [updateUnderlinePosition])

  const getTabIndex = (tabId: string) => {
    const tabIds = ['all', 'crm', 'project', 'finance', 'hr']
    return tabIds.indexOf(tabId)
  }

  // Quick Access Items
  const quickAccessItems = [
    { icon: faTachometerAlt, title: 'Dashboard', href: '/dashboard', iconColor: 'text-blue-500', gradient: 'bg-gradient-azure' },
    { icon: faPlay, title: 'Video', href: '/video-gallery', iconColor: 'text-emerald-500', gradient: 'bg-gradient-emerald' },
    { icon: faCalendarAlt, title: 'Calendar', href: '/calendar', iconColor: 'text-amber-500', gradient: 'bg-gradient-amber' },
    { icon: faClock, title: 'Time Tracking', href: '/time-tracking', iconColor: 'text-rose-500', gradient: 'bg-gradient-rose' },
    { icon: faFolder, title: 'Projects', href: '/projects', iconColor: 'text-indigo-500', gradient: 'bg-gradient-indigo' },
    { icon: faFileInvoice, title: 'Invoices', href: '/invoices', iconColor: 'text-teal-500', gradient: 'bg-gradient-teal' },
  ]

  // Stats Data
  const stats = [
    { value: 10250, label: 'Active Users', icon: faUsers, suffix: '+', iconColor: 'text-blue-500' },
    { value: 528, label: 'Companies', icon: faBuilding, suffix: '+', iconColor: 'text-emerald-500' },
    { value: 98, label: 'Satisfaction', icon: faStar, suffix: '%', iconColor: 'text-amber-500' },
    { value: 24, label: 'Support', icon: faHeadset, suffix: '/7', iconColor: 'text-rose-500' },
  ]

  // Features Data
  const features = {
    all: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', iconColor: 'text-blue-500', gradient: 'bg-gradient-azure' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', iconColor: 'text-indigo-500', gradient: 'bg-gradient-indigo' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', iconColor: 'text-teal-500', gradient: 'bg-gradient-teal' },
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', iconColor: 'text-emerald-500', gradient: 'bg-gradient-emerald' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', iconColor: 'text-lime-500', gradient: 'bg-gradient-lime' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', iconColor: 'text-amber-500', gradient: 'bg-gradient-amber' },
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', iconColor: 'text-yellow-600', gradient: 'bg-gradient-silver' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', iconColor: 'text-orange-500', gradient: 'bg-gradient-copper' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', iconColor: 'text-slate-500', gradient: 'bg-gradient-silver' },
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', iconColor: 'text-rose-500', gradient: 'bg-gradient-rose' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', iconColor: 'text-pink-500', gradient: 'bg-gradient-pink' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', iconColor: 'text-fuchsia-500', gradient: 'bg-gradient-fuchsia' },
    ],
    crm: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', iconColor: 'text-blue-500', gradient: 'bg-gradient-azure' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', iconColor: 'text-indigo-500', gradient: 'bg-gradient-indigo' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', iconColor: 'text-teal-500', gradient: 'bg-gradient-teal' },
    ],
    project: [
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', iconColor: 'text-emerald-500', gradient: 'bg-gradient-emerald' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', iconColor: 'text-lime-500', gradient: 'bg-gradient-lime' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', iconColor: 'text-amber-500', gradient: 'bg-gradient-amber' },
    ],
    finance: [
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', iconColor: 'text-yellow-600', gradient: 'bg-gradient-gold' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', iconColor: 'text-orange-500', gradient: 'bg-gradient-copper' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', iconColor: 'text-slate-500', gradient: 'bg-gradient-silver' },
    ],
    hr: [
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', iconColor: 'text-rose-500', gradient: 'bg-gradient-rose' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', iconColor: 'text-pink-500', gradient: 'bg-gradient-pink' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', iconColor: 'text-fuchsia-500', gradient: 'bg-gradient-fuchsia' },
    ],
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 3000)
      setNewsletterEmail('')
    }
  }

  const isRevealed = (sectionId: string) => revealedSections.includes(sectionId)
  const isLoading = status === 'loading'

  return (
    <>
      {/* HERO SECTION */}
      <section 
        id="hero" 
        ref={el => { if (el) sectionsRef.current[0] = el as HTMLDivElement }}
        className="relative min-h-screen flex items-center justify-center bg-transparent"
      >
        <div className="relative container text-center py-20">
          {/* Logo */}
          <div className={cn(
            "flex justify-center mb-8 transition-all duration-700",
            isRevealed('hero') ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'
          )}>
            <Logo variant="hero" />
          </div>

          {/* Search Input */}
          <div className={cn(
            "relative z-20 mb-12 max-w-2xl mx-auto transition-all duration-700 delay-200",
            isRevealed('hero') ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'
          )}>
            <SearchInput 
              data={searchData}
              onResultSelect={handleResultSelect}
              placeholder="Try searching for 'CRM', 'API', 'Mobile App'..."
            />
          </div>

        

          {/* Quick Access Cards */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-700 delay-400",
            isRevealed('hero') ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'
          )}>
            {quickAccessItems.map((item, index) => (
              <QuickCard
                key={index}
                icon={item.icon}
                title={item.title}
                href={item.href}
                isAuthenticated={!!session}
                subtitle="Login required"
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section 
        id="stats" 
        ref={el => { if (el) sectionsRef.current[1] = el as HTMLDivElement }}
        className="py-20 bg-transparent"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                iconColor={stat.iconColor}
                delay={index}
                isRevealed={isRevealed('stats')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mt-2">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-tertiary mt-2 max-w-2xl mx-auto">
              Powerful tools designed to help you work smarter, not harder
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="w-full max-w-4xl">
              <Tabs
                items={featureTabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features[activeTab as keyof typeof features].map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                href={`/features/${feature.title.toLowerCase()}`}
                iconColor={feature.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section 
        id="newsletter" 
        ref={el => { if (el) sectionsRef.current[3] = el as HTMLDivElement }}
        className="py-20 bg-primary"
      >
        <div className="container max-w-2xl mx-auto text-center px-4">
          <div className={isRevealed('newsletter') ? 'animate-fade-in-up' : 'opacity-0'}>
            {/* Icon */}
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faEnvelope} className="text-5xl text-tertiary" />
            </div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Stay in the loop
            </h2>
            
            {/* Description */}
            <p className="text-xl text-secondary mb-8">
              Get the latest updates, features, and insights delivered straight to your inbox.
            </p>

            {/* Form */}
            {isSubmitted ? (
              <div className="bg-success/10 border border-success/30 rounded-2xl p-4">
                <p className="text-success flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
                  Thanks for subscribing! Check your email for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto justify-center">
                <EmailInput
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(val) => setNewsletterEmail(val)}
                  required
                  className="flex-1 min-w-60"
                  inputSize="lg"
                />
                <Button type="submit" variant="primary" size="lg" rightIcon={faRocket}>
                  Subscribe
                </Button>
              </form>
            )}
            
            {/* Footer text */}
            <p className="text-sm text-tertiary mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </>
  )
}