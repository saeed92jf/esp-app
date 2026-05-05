'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/Logo/Logo'

export function Footer() {
  const year = new Date().getFullYear()

  const sections = [
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'HR',
      links: [
        { name: 'Recruitment', href: '/hr/recruitment' },
        { name: 'Management', href: '/hr/management' },
        { name: 'Payroll', href: '/hr/payroll' },
      ],
    },
    {
      title: 'Marketing',
      links: [
        { name: 'Campaigns', href: '/marketing/campaigns' },
        { name: 'Analytics', href: '/marketing/analytics' },
        { name: 'Content', href: '/marketing/content' },
      ],
    },
    {
      title: 'Project',
      links: [
        { name: 'Planning', href: '/project/planning' },
        { name: 'Tasks', href: '/project/tasks' },
        { name: 'Reports', href: '/project/reports' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Cookies', href: '/cookies' },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo variant="footer" />
            <p className="text-gray-400 text-sm mt-4">Unified platform for engineering and service businesses.</p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">&copy; {year} ESP Webapp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}