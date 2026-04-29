import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-white">
                ESP<span className="text-blue-600">Webapp</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              The unified platform for engineering and service businesses.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-blue-400 transition">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-blue-400 transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Integrations</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition">About</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Security</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">GDPR</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ESP Webapp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}