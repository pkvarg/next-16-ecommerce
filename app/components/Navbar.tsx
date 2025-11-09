import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="shrink-0">
            <Link
              href="/"
              className="text-white font-bold text-xl hover:text-purple-300 transition-colors"
            >
              Next 16 Ecommerce
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-white hover:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/image-upload"
              className="text-white hover:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
            >
              Images
            </Link>
            <Link
              href="/admin"
              className="text-white hover:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
            >
              Admin
            </Link>
            <Link
              href="/login"
              className="text-white bg-purple-500/20 hover:bg-purple-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-purple-400/50"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
