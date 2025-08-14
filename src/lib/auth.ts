import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcrypt'
import logger from '@/lib/logger'

const client = new MongoClient(process.env.MONGODB_URI!, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 20000,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  family: 4
})
const clientPromise = Promise.resolve(client)

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
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

        const startTime = Date.now()
        try {
          logger.info('Starting authentication', { email: credentials.email })
          
          await dbConnect()
          logger.info('Database connected', { duration: Date.now() - startTime })
          
          const user = await User.findOne({ email: credentials.email })
          logger.info('User query completed', { 
            found: !!user, 
            duration: Date.now() - startTime 
          })
          
          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          logger.info('Password validation completed', { 
            valid: isPasswordValid, 
            duration: Date.now() - startTime 
          })
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          logger.error('Authentication failed', error as Error, {
            email: credentials.email,
            method: 'credentials_login',
            duration: Date.now() - startTime
          })
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const getAuthSession = async () => await getServerSession(authOptions)