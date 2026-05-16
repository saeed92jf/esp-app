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
  faCrown, faWrench, faUserAlt
} from '@fortawesome/free-solid-svg-icons'
import { Button, EmailInput, CountUp, SearchInput, Tabs } from '@/components/ui'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils'

// ============================================
// HOME CLIENT COMPONENT
// Landing page with hero section, stats, features, and newsletter
// Fully responsive with scroll animations
// Uses Tailwind CSS - no separate CSS file needed
// ============================================

export function HomeClient() {
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
    { icon: faTachometerAlt, title: 'Dashboard', href: '/dashboard', iconColor: 'text-blue-500' },
    { icon: faUsers, title: 'CRM', href: '/', iconColor: 'text-emerald-500' },
    { icon: faCalendarAlt, title: 'Calendar', href: '/', iconColor: 'text-amber-500' },
    { icon: faClock, title: 'Time Tracking', href: '/', iconColor: 'text-rose-500' },
    { icon: faFolder, title: 'Projects', href: '/', iconColor: 'text-indigo-500' },
    { icon: faFileInvoice, title: 'Invoices', href: '/', iconColor: 'text-teal-500' },
  ]

  // Stats Data
  const stats = [
    { value: 10250, label: 'Active Users', icon: faUsers, suffix: '+', iconColor: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20' },
    { value: 528, label: 'Companies', icon: faBuilding, suffix: '+', iconColor: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20' },
    { value: 98, label: 'Satisfaction', icon: faStar, suffix: '%', iconColor: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20' },
    { value: 24, label: 'Support', icon: faHeadset, suffix: '/7', iconColor: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' },
  ]

  // Features Data
  const features = {
    all: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', iconColor: 'text-blue-500' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', iconColor: 'text-indigo-500' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', iconColor: 'text-teal-500' },
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', iconColor: 'text-emerald-500' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', iconColor: 'text-lime-500' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', iconColor: 'text-amber-500' },
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', iconColor: 'text-yellow-600' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', iconColor: 'text-orange-500' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', iconColor: 'text-slate-500' },
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', iconColor: 'text-rose-500' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', iconColor: 'text-pink-500' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', iconColor: 'text-fuchsia-500' },
    ],
    crm: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', iconColor: 'text-blue-500' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', iconColor: 'text-indigo-500' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', iconColor: 'text-teal-500' },
    ],
    project: [
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', iconColor: 'text-emerald-500' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', iconColor: 'text-lime-500' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', iconColor: 'text-amber-500' },
    ],
    finance: [
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', iconColor: 'text-yellow-600' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', iconColor: 'text-orange-500' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', iconColor: 'text-slate-500' },
    ],
    hr: [
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', iconColor: 'text-rose-500' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', iconColor: 'text-pink-500' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', iconColor: 'text-fuchsia-500' },
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
    <div className="fixed inset-0 -z-10 bg-gradient-hero" />
<div className="relative z-10">
      {/* HERO SECTION */}
      <section 
        id="hero" 
        ref={el => { if (el) sectionsRef.current[0] = el as HTMLDivElement }}
        className="relative min-h-screen flex items-center justify-center bg-transparent "
      >
        <div className="relative container text-center py-20">
          {/* Logo */}
          <div className={cn(
            "flex justify-center mb-8",
            isRevealed('hero') ? 'animate-fade-in-up delay-200' : 'opacity-0'
          )}>
            <Logo variant="hero" />
          </div>

          {/* Search Input */}
          <div className={cn(
            "relative z-20 mb-4",
            isRevealed('hero') ? 'animate-fade-in-up delay-200' : 'opacity-0'
          )}>
            <SearchInput />
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {quickAccessItems.map((item, index) => (
              <Link
                key={index}
                href={session ? item.href : '/login'}
                className="group block text-center p-4 rounded-2xl transition-all duration-300 hover:bg-tertiary"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-tertiary flex items-center justify-center transition-all duration-300 group-hover:bg-primary">
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={cn("w-6 h-6 transition-colors duration-300", item.iconColor, "group-hover:text-inverse")}
                  />
                </div>
                <div className="text-sm font-semibold text-secondary transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </div>
                {!session && (
                  <div className="text-xs text-tertiary mt-1">Login required</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section 
        id="stats" 
        ref={el => { if (el) sectionsRef.current[1] = el as HTMLDivElement }}
        className="py-16 bg-transparent"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={cn(
                  "text-center p-6 rounded-2xl bg-primary border border-light shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  isRevealed('stats') ? `animate-fade-in-up` : 'opacity-0'
                )}
                style={{ animationDelay: isRevealed('stats') ? `${(index + 1) * 100}ms` : '0ms' }}
              >
                <div className={cn("w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center", stat.iconColor)}>
                  <FontAwesomeIcon icon={stat.icon} className="w-7 h-7" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} duration={2000} />
                </div>
                <div className="text-sm font-medium text-secondary">{stat.label}</div>
              </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-secondary mt-2 max-w-2xl mx-auto">
              Powerful tools designed to help you work smarter, not harder
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <Tabs
              items={featureTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="w-full max-w-4xl"
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features[activeTab as keyof typeof features].map((feature, index) => (
              <Link
                key={index}
                href={`/features/${feature.title.toLowerCase()}`}
                className="group block p-6 rounded-2xl bg-primary border border-light transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary"
              >
                <div className="w-14 h-14 rounded-xl bg-tertiary flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary group-hover:scale-105">
                  <FontAwesomeIcon 
                    icon={feature.icon} 
                    className={cn("text-2xl transition-colors duration-300", feature.iconColor, "group-hover:text-inverse")}
                  />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2 transition-colors duration-300 group-hover:text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {feature.desc}
                </p>
                <div className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                  Learn more
                  <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
                </div>
              </Link>
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
      </div>
    </>
  )
}