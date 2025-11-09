import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your NestJS /auth/login endpoint
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { 'Content-Type': 'application/json' },
          })

          const data = await res.json()

          if (res.ok && data.accessToken) {
            // Return user object with accessToken
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              accessToken: data.accessToken,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          console.log('Google sign-in attempt for:', profile.email)

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3016'
          console.log('API URL:', apiUrl)

          // Sync Google user with your NestJS backend
          const res = await fetch(`${apiUrl}/auth/signup/google`, {
            method: 'POST',
            body: JSON.stringify({
              email: profile.email,
              name: profile.name || '',
              googleId: (profile as any).sub,
            }),
            headers: { 'Content-Type': 'application/json' },
          })

          if (!res.ok) {
            console.error('Backend responded with:', res.status, res.statusText)
            const errorText = await res.text()
            console.error('Error body:', errorText)
            return false
          }

          const data = await res.json()
          console.log('Backend response:', data)

          // Store the accessToken from backend in the user object
          if (user && data && data.accessToken) {
            (user as any).accessToken = data.accessToken;
            (user as any).id = data.user?.id || (profile as any).sub;
            (user as any).name = data.user?.name || profile.name;
            console.log('User data stored successfully')
          } else {
            console.error('Missing data in response:', data)
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = (user as any).accessToken // JWT from NestJS
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session as any).accessToken = token.accessToken
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
