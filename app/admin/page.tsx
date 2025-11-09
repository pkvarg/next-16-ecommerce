import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Double-check authorization on server side
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email)

  if (!session || !isAdmin) {
    redirect('/')
  }

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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
            <div className="border-t border-white/20 pt-4 mt-4">
              <p className="text-purple-200 mb-2">
                Welcome, <span className="text-white font-semibold">{session.user?.name || session.user?.email}</span>
              </p>
              <p className="text-purple-300 text-sm">
                Email: {session.user?.email}
              </p>
            </div>

            {/* Admin content goes here */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Users</h3>
                <p className="text-3xl font-bold text-purple-300">0</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Images</h3>
                <p className="text-3xl font-bold text-purple-300">0</p>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Activity</h3>
                <p className="text-3xl font-bold text-purple-300">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
