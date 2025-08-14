'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings
} from 'lucide-react'

export function BottomNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Alunos', href: '/students', icon: Users },
    { name: 'Ocorrências', href: '/occurrences', icon: FileText },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  ]

  if (session?.user.role === 'admin' || session?.user.role === 'coordinator') {
    navigation.push({ name: 'Config', href: '/settings', icon: Settings })
  }

  // Only show bottom navigation on authenticated pages and on mobile
  if (!session || pathname === '/login') {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
      <div className={`grid ${navigation.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 min-h-[60px] ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 active:bg-slate-50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}