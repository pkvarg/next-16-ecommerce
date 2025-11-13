import ContactForm from '@/components/ContactForm'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">Welcome</h1>
          <p className="text-xl text-purple-200 mb-8">
            Your journey to amazing experiences starts here
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-6xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
