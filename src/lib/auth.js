import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { client } from '@/sanity/lib/client'
import { mockUserStorage } from './mock-storage'

// Check if we should use mock storage
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log(`Authenticating user: ${credentials.email} using ${useMockStorage ? 'MOCK STORAGE' : 'SANITY'}`)
          
          let user
          if (useMockStorage) {
            user = await mockUserStorage.findByEmail(credentials.email)
            console.log('Mock storage user lookup result:', user ? 'USER FOUND' : 'USER NOT FOUND')
          } else {
            // Query user from Sanity
            user = await client.fetch(
              `*[_type == "user" && email == $email][0]{
                _id,
                name,
                email,
                userType,
                isActive,
                password,
                avatar
              }`,
              { email: credentials.email }
            )
            console.log('Sanity user lookup result:', user ? 'USER FOUND' : 'USER NOT FOUND')
          }

          if (!user) {
            console.log('❌ User not found for email:', credentials.email)
            return null
          }

          if (!user.isActive) {
            console.log('❌ User account is inactive for:', credentials.email)
            return null
          }

          console.log('✅ User found, checking password...')
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Password validation failed for:', credentials.email)
            return null
          }

          console.log('🎉 Authentication successful for user:', user.email)
          
          // Return user data (without password)
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            image: user.avatar?.asset?.url || user.avatar?.url || null,
          }
        } catch (error) {
          console.error('💥 Authentication error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.id = user.id
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      session.user.userType = token.userType
      session.user.id = token.id
      if (token.picture) {
        session.user.image = token.picture
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
