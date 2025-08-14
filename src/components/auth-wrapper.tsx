'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './navbar'
import { BottomNavigation } from './bottom-navigation'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navbar - Hidden on Mobile when using Mobile Headers */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Main content with mobile padding for bottom nav */}
      <main className="max-w-7xl mx-auto md:py-6 sm:px-6 lg:px-8">
        <div className="md:px-4 md:py-6 sm:px-0 pb-16 md:pb-0">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}