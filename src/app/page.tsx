import { Button, Card, EmailInput, PhoneInput, PasswordInput, NumberInput, Textarea } from '@/components/ui'
import { SearchInput } from '@/modules/search'


export default function Home() {
  const features = [
    { title: 'CRM', description: 'Manage client relationships and interactions in one centralized system.', icon: '👥' },
    { title: 'Pipeline', description: 'Track leads and deals through your sales pipeline with visual workflows.', icon: '📊' },
    { title: 'Scheduling', description: 'Book appointments and manage your calendar with automated reminders.', icon: '📅' },
    { title: 'Client Portal', description: 'Provide clients with a secure portal to access their projects and documents.', icon: '🔒' },
    { title: 'Estimates', description: 'Create and send professional estimates to clients with customizable templates.', icon: '💰' },
    { title: 'Proposals', description: 'Craft winning proposals with customizable templates and e-signature capability.', icon: '📝' },
    { title: 'Agreements', description: 'Generate legally binding agreements quickly with our template library.', icon: '⚖️' },
    { title: 'Forms', description: 'Create custom forms to collect client information and streamline onboarding.', icon: '📋' },
    { title: 'Projects', description: 'Organize and manage all your client projects in one intuitive dashboard.', icon: '📁' },
    { title: 'Tasks', description: 'Assign, track, and manage tasks to keep projects on schedule and team aligned.', icon: '✅' },
    { title: 'Time Tracking', description: 'Track billable hours, monitor productivity, and generate accurate time reports.', icon: '⏱️' },
    { title: 'Timesheets', description: 'Create, manage, and approve timesheets for accurate billing and payroll.', icon: '📊' },
  ]

  return (
    <>
      {/* Hero Section with Search */}
      <section className="bg-linear-to-br from-blue-50 via-white to-blue-50 py-16 md:py-20">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">ESP Webapp</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            The Unified Platform for Engineering and Service Businesses.
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Consolidate your projects, clients, and billing into one integrated, easy-to-use platform.
          </p>
          
          {/* Search Input زیر Welcome */}
          <div className="mb-8">
            <SearchInput />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Submit a Join Request
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(4)}<span className="text-gray-300">★</span>
            </div>
            <span className="text-gray-600">1,020+ Reviews</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All-in-One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run your service business efficiently in one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} variant="hover">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form Demo Section - نمایش انواع اینپوت‌ها */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Try Our Input Components
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              All inputs come with built-in validation
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Demo Form</h3>
            <div className="space-y-5">
              <EmailInput placeholder="Email address" />
              <PhoneInput placeholder="Phone number" />
              <PasswordInput placeholder="Password" />
              <NumberInput placeholder="Age" min={0} max={150} />
              <Textarea placeholder="Message" rows={4} />
              <Button variant="primary" className="w-full">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}