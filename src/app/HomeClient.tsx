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
import { Card, CardContent } from '@/components/ui'

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

  const quickAccessItems = [
    { icon: faTachometerAlt, title: 'Dashboard', href: '/dashboard', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500 dark:bg-blue-500/10' },
    { icon: faUsers, title: 'CRM', href: '/', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-500/10' },
    { icon: faCalendarAlt, title: 'Calendar', href: '/', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 dark:bg-green-500/10' },
    { icon: faClock, title: 'Time Tracking', href: '/', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-500/10' },
    { icon: faFolder, title: 'Projects', href: '/', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 dark:bg-red-500/10' },
    { icon: faFileInvoice, title: 'Invoices', href: '/', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-500/10' },
  ]

 // ============================================
// STATS DATA with colors
// ============================================
const stats = [
  { 
    value: 10250, 
    label: 'Active Users', 
    icon: faUsers, 
    suffix: '+',
    iconColor: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    numberColor: 'text-blue-600 dark:text-blue-400',
    labelColor: 'text-blue-600/80 dark:text-blue-400/80'
  },
  { 
    value: 528, 
    label: 'Companies', 
    icon: faBuilding, 
    suffix: '+',
    iconColor: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20',
    numberColor: 'text-emerald-600 dark:text-emerald-400',
    labelColor: 'text-emerald-600/80 dark:text-emerald-400/80'
  },
  { 
    value: 98, 
    label: 'Satisfaction', 
    icon: faStar, 
    suffix: '%',
    iconColor: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20',
    numberColor: 'text-amber-600 dark:text-amber-400',
    labelColor: 'text-amber-600/80 dark:text-amber-400/80'
  },
  { 
    value: 24, 
    label: 'Support', 
    icon: faHeadset, 
    suffix: '/7',
    iconColor: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
    numberColor: 'text-purple-600 dark:text-purple-400',
    labelColor: 'text-purple-600/80 dark:text-purple-400/80'
  },
]

  const features = {
    all: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', color: 'from-blue-500 to-blue-600' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', color: 'from-indigo-500 to-indigo-600' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', color: 'from-green-500 to-green-600' },
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', color: 'from-cyan-500 to-cyan-600' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', color: 'from-emerald-500 to-emerald-600' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', color: 'from-orange-500 to-orange-600' },
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', color: 'from-amber-500 to-amber-600' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', color: 'from-yellow-500 to-yellow-600' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', color: 'from-lime-500 to-lime-600' },
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', color: 'from-pink-500 to-pink-600' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', color: 'from-rose-500 to-rose-600' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', color: 'from-fuchsia-500 to-fuchsia-600' },
    ],
    crm: [
      { icon: faUsers, title: 'CRM', desc: 'Manage client relationships and interactions.', category: 'crm', color: 'from-blue-500 to-blue-600' },
      { icon: faChartLine, title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline.', category: 'crm', color: 'from-indigo-500 to-indigo-600' },
      { icon: faCalendarAlt, title: 'Scheduling', desc: 'Book appointments and manage your calendar.', category: 'crm', color: 'from-green-500 to-green-600' },
    ],
    project: [
      { icon: faFolder, title: 'Projects', desc: 'Organize and manage all your client projects.', category: 'project', color: 'from-cyan-500 to-cyan-600' },
      { icon: faUserCheck, title: 'Tasks', desc: 'Assign, track, and manage tasks efficiently.', category: 'project', color: 'from-emerald-500 to-emerald-600' },
      { icon: faClock, title: 'Time Tracking', desc: 'Track billable hours accurately.', category: 'project', color: 'from-orange-500 to-orange-600' },
    ],
    finance: [
      { icon: faFileInvoice, title: 'Estimates', desc: 'Create and send professional estimates.', category: 'finance', color: 'from-amber-500 to-amber-600' },
      { icon: faFileInvoice, title: 'Invoices', desc: 'Generate and send invoices to clients.', category: 'finance', color: 'from-yellow-500 to-yellow-600' },
      { icon: faChartLine, title: 'Reports', desc: 'Detailed financial reports and analytics.', category: 'finance', color: 'from-lime-500 to-lime-600' },
    ],
    hr: [
      { icon: faUsers, title: 'Recruitment', desc: 'Manage job postings and candidates.', category: 'hr', color: 'from-pink-500 to-pink-600' },
      { icon: faUserCheck, title: 'Onboarding', desc: 'Streamline new employee onboarding.', category: 'hr', color: 'from-rose-500 to-rose-600' },
      { icon: faFileInvoice, title: 'Payroll', desc: 'Manage employee payroll and benefits.', category: 'hr', color: 'from-fuchsia-500 to-fuchsia-600' },
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
        className="relative min-h-screen flex items-center justify-center bg-primary"
      >
        <div className="relative container text-center py-20">
          <div className="flex justify-center mb-8 animate-fade-in-up delay-200">
            <Logo variant="hero" />
          </div>

          <div className={`relative z-20 mb-4 ${isRevealed('hero') ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <SearchInput />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {quickAccessItems.map((item, index) => (
              <Link
                key={index}
                href={session ? item.href : '/login'}
                className="quick-card group"
              >
                <div className="quick-card-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <div className="quick-card-title">{item.title}</div>
                {!session && (
                  <div className="quick-card-subtitle">Login required</div>
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
  className="stats-section"
>
  <div className="stats-container rounded-2xl p-8">
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`stats-card ${isRevealed('stats') ? `animate-stats stats-delay-${index + 1}` : 'stats-hidden'}`}
        >
          <div className={`stats-icon ${stat.iconColor}`}>
            <FontAwesomeIcon icon={stat.icon} />
          </div>
          <div className={`stats-number ${stat.numberColor}`}>
            <CountUp end={stat.value} suffix={stat.suffix} duration={2000} />
          </div>
          <div className={`stats-label ${stat.labelColor}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* FEATURES SECTION */}
      <section className="section bg-primary">
        <div className="container">
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

          <div className="flex justify-center mb-12">
            <Tabs
              items={featureTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              className="w-full max-w-4xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features[activeTab as keyof typeof features].map((feature, index) => (
              <Link
                key={index}
                href={`/features/${feature.title.toLowerCase()}`}
                className="feature-card group"
              >
                <div className="feature-card-icon">
                  <FontAwesomeIcon icon={feature.icon} className="text-xl" />
                </div>
                <h3 className="feature-card-title">
                  {feature.title}
                </h3>
                <p className="feature-card-desc">
                  {feature.desc}
                </p>
                <div className="feature-card-link">
                  Learn more
                  <FontAwesomeIcon icon={faChevronRight} />
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
  className="section bg-primary"
>
  <div className="container max-w-2xl mx-auto text-center">
    <div className={isRevealed('newsletter') ? 'animate-fade-in-up' : 'opacity-0'}>
      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-0">
        <FontAwesomeIcon icon={faEnvelope} className="text-5xl text-disabled" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
        Stay in the loop
      </h2>
      <p className="text-xl text-secondary mb-8">
        Get the latest updates, features, and insights delivered straight to your inbox.
      </p>

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
      <p className="text-sm text-tertiary mt-4">No spam. Unsubscribe anytime.</p>
    </div>
  </div>
</section>
    </>
  )
}