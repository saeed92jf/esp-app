// app/page.tsx (Home page)
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
import { Button, EmailInput, CountUp, SearchInput } from '@/components/ui'
import { Logo } from '@/components/ui'

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

  // تابع برای گرفتن آیکون نقش
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN': return faCrown
      case 'ENGINEER': return faWrench
      case 'EMPLOYEE': return faBriefcase
      default: return faUserAlt
    }
  }

  // تابع برای گرفتن متن نقش
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

  // Update underline position when active tab changes
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

  // ============================================
  // QUICK ACCESS ITEMS
  // ============================================
  const quickAccessItems = [
    { icon: faTachometerAlt, title: 'Dashboard', href: '/dashboard', color: 'from-blue-500 to-blue-600' },
    { icon: faUsers, title: 'CRM', href: '/crm', color: 'from-purple-500 to-purple-600' },
    { icon: faCalendarAlt, title: 'Calendar', href: '/calendar', color: 'from-green-500 to-green-600' },
    { icon: faClock, title: 'Time Tracking', href: '/time', color: 'from-orange-500 to-orange-600' },
    { icon: faFolder, title: 'Projects', href: '/projects', color: 'from-red-500 to-red-600' },
    { icon: faFileInvoice, title: 'Invoices', href: '/invoices', color: 'from-teal-500 to-teal-600' },
  ]

  // ============================================
  // STATS DATA with actual values for countup
  // ============================================
  const stats = [
    { value: 10250, label: 'Active Users', icon: faUsers, suffix: '+' },
    { value: 528, label: 'Companies', icon: faBuilding, suffix: '+' },
    { value: 98, label: 'Satisfaction', icon: faStar, suffix: '%' },
    { value: 24, label: 'Support', icon: faHeadset, suffix: '/7' },
  ]

  // ============================================
  // TABS WITH ICONS
  // ============================================
  const tabs = [
    { id: 'all', label: 'All Features', icon: faChartSimple },
    { id: 'crm', label: 'CRM', icon: faUserGroup },
    { id: 'project', label: 'Projects', icon: faFolder },
    { id: 'finance', label: 'Finance', icon: faMoneyBill },
    { id: 'hr', label: 'HR', icon: faBriefcase },
  ]

  // ============================================
  // FEATURES DATA
  // ============================================
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

      {/* ============================================
         HERO SECTION
         ============================================ */}
      <section 
        id="hero" 
        ref={el => { if (el) sectionsRef.current[0] = el as HTMLDivElement }}
        className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 via-white to-primary-100 dark:from-primary-950 dark:via-gray-900 dark:to-primary-900"
      >
        <div className="relative container text-center py-20">
          {/* Logo */}
            <div className="flex justify-center mb-8 animate-fade-in-up delay-200">
  <Link href="/" className="inline-flex items-center gap-4">
    <Logo variant="hero" />
  </Link>
</div>

       

          {/* Search Input */}
          <div className={`relative z-20 mb-6 ${isRevealed('hero') ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            <SearchInput />
          </div>
          
          {/* Access Status Message - فقط پیام بدون لینک */}
          <div className={`mt-6 ${isRevealed('hero') ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            {!isLoading && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {session ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Logged in as
                    </span>
                    <FontAwesomeIcon 
                      icon={getRoleIcon(session.user?.role)} 
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.user?.name}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {getRoleLabel(session.user?.role)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    You have limited access. Please login to get full access.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Access Section */}
          <div className={`mb-12 mt-12 ${isRevealed('hero') ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
            <div className="text-center mb-6">
              <span className="text-primary dark:text-primary-400 font-semibold text-sm uppercase tracking-wider opacity-70">
                Quick Access
              </span>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm mt-1">Jump to your workspace</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickAccessItems.map((item, index) => (
                <Link
                  key={index}
                  href={session ? item.href : '/login'}
                  className={`group block text-center p-5 rounded-3xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 ${
                    !session && 'opacity-50 hover:opacity-70'
                  } ${
                    isRevealed('hero') ? `animate-fade-in-up delay-${400 + (index + 1) * 50}` : 'opacity-0'
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 shadow-md`}>
                    <FontAwesomeIcon icon={item.icon} className="text-white text-xl" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</span>
                  {!session && (
                    <span className="text-xs text-gray-400 block mt-1">(Login required)</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         STATS SECTION with CountUp Animation
         ============================================ */}
      <section 
        id="stats" 
        ref={el => { if (el) sectionsRef.current[1] = el as HTMLDivElement }}
        className="section bg-linear-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600"
      >
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:bg-white/20 dark:hover:bg-black/30 ${
                  isRevealed('stats') ? `animate-fade-in-up delay-${(index + 1) * 100}` : 'opacity-0'
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={stat.icon} className="text-2xl text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} duration={2000} />
                </div>
                <div className="text-primary-100 dark:text-primary-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
         FEATURES SECTION with Sliding Underline Tabs
         ============================================ */}
      <section 
        id="features" 
        ref={el => { if (el) sectionsRef.current[2] = el as HTMLDivElement }}
        className="section bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="container">
          {/* Section Header */}
          <div className={`text-center mb-12 ${isRevealed('features') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className="text-primary dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              Powerful tools designed to help you work smarter, not harder
            </p>
          </div>

          {/* Tabs with Sliding Underline */}
          <div className="flex justify-center mb-12">
            <div 
              ref={containerRef}
              className="relative flex flex-wrap justify-center gap-2 bg-white dark:bg-gray-800/50 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={el => { if (el) tabsRef.current[index] = el }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 z-10 ${
                    activeTab === tab.id
                      ? 'text-primary dark:text-primary-400 bg-transparent'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              
              {/* Animated Underline */}
              <div
                className="tabs-underline"
                style={{
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                  bottom: '0px',
                  height: '3px',
                }}
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features[activeTab as keyof typeof features].map((feature, index) => (
              <div
                key={index}
                className={`group bg-white dark:bg-gray-800 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 dark:border-gray-700 ${
                  isRevealed('features') ? `animate-fade-in-up delay-${(index % 8 + 1) * 100}` : 'opacity-0'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-md`}>
                  <FontAwesomeIcon icon={feature.icon} className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-primary dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  Learn more
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
         CTA SECTION
         ============================================ */}
      <section className="section bg-linear-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your business?
            </h2>
            <p className="text-lg text-primary-100 dark:text-primary-200 mb-8">
              Join thousands of satisfied customers and start your journey today
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={session ? "/dashboard" : "/register"}>
                <Button variant="primary" size="lg" rightIcon={faArrowRight} className="bg-white text-primary hover:bg-gray-100 dark:bg-gray-100 dark:text-primary-700">
                  {session ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
         NEWSLETTER SECTION
         ============================================ */}
      <section 
        id="newsletter" 
        ref={el => { if (el) sectionsRef.current[3] = el as HTMLDivElement }}
        className="section bg-white dark:bg-gray-900"
      >
        <div className="container max-w-2xl mx-auto text-center">
          <div className={isRevealed('newsletter') ? 'animate-fade-in-up' : 'opacity-0'}>
            <div className="w-20 h-20 mx-auto bg-primary/10 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
              <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-primary dark:text-primary-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stay in the loop
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Get the latest updates, features, and insights delivered straight to your inbox.
            </p>

            {isSubmitted ? (
              <div className="bg-success/10 dark:bg-success-500/20 border border-success/30 dark:border-success-500/30 rounded-2xl p-4">
                <p className="text-success dark:text-success-400 flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
                  Thanks for subscribing! Check your email for confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <EmailInput
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(val) => setNewsletterEmail(val)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="primary" size="lg" rightIcon={faRocket}>
                  Subscribe
                </Button>
              </form>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Styles for Sliding Underline */}
      <style jsx>{`
        .tabs-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          z-index: 1;
          box-shadow: 0 0 8px #4f46e5;
        }
        
        .dark .tabs-underline {
          background: linear-gradient(90deg, #818cf8, #a5b4fc);
          box-shadow: 0 0 8px #6366f1;
        }
      `}</style>
    </>
  )
}