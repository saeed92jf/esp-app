'use client'

import Link from 'next/link'

export function HomeClient() {
  const features = [
    { icon: '👥', title: 'CRM', desc: 'Manage client relationships and interactions in one centralized system.' },
    { icon: '📊', title: 'Pipeline', desc: 'Track leads and deals through your sales pipeline with visual workflows.' },
    { icon: '📅', title: 'Scheduling', desc: 'Book appointments and manage your calendar with automated reminders.' },
    { icon: '🔒', title: 'Client Portal', desc: 'Provide clients with a secure portal to access their projects and documents.' },
    { icon: '💰', title: 'Estimates', desc: 'Create and send professional estimates to clients with customizable templates.' },
    { icon: '📝', title: 'Proposals', desc: 'Craft winning proposals with customizable templates and e-signature capability.' },
    { icon: '⚖️', title: 'Agreements', desc: 'Generate legally binding agreements quickly with our template library.' },
    { icon: '📋', title: 'Forms', desc: 'Create custom forms to collect client information and streamline onboarding.' },
    { icon: '📁', title: 'Projects', desc: 'Organize and manage all your client projects in one intuitive dashboard.' },
    { icon: '✅', title: 'Tasks', desc: 'Assign, track, and manage tasks to keep projects on schedule and team aligned.' },
    { icon: '⏱️', title: 'Time Tracking', desc: 'Track billable hours, monitor productivity, and generate accurate time reports.' },
    { icon: '📊', title: 'Timesheets', desc: 'Create, manage, and approve timesheets for accurate billing and payroll.' },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500+', label: 'Companies' },
    { value: '98%', label: 'Satisfaction' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now Available
            </div>
            <h1 className="animate-fade-in">
              Welcome to <span className="text-primary">ESP Webapp</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto animate-fade-in">
              The Unified Platform for Engineering and Service Businesses.
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto animate-fade-in">
              Consolidate your projects, clients, and billing into one integrated platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <Link href="/register" className="btn btn-primary btn-lg">
                Submit a Join Request
              </Link>
              <Link href="#features" className="btn btn-outline btn-lg">
                Watch Demo
              </Link>
            </div>

            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-300">1,020+ Reviews</span> from happy customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container">
          <div className="features-grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-gray-50 dark:bg-gray-800/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="mb-4">All-in-One Platform</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to run your service business efficiently in one place
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="card card-hover text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-text max-w-2xl mx-auto">
            Join thousands of businesses that use ESP Webapp to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn bg-white text-primary hover:bg-gray-100 btn-lg">
              Start Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 btn-lg">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}