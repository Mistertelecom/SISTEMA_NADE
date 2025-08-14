'use client'

import { ArrowLeft, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBackClick?: () => void
  rightElement?: React.ReactNode
}

export function MobileHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  onBackClick,
  rightElement 
}: MobileHeaderProps) {
  const router = useRouter()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {/* Top Row - Logo and Back Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-white hover:bg-white/10 p-2 h-auto"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logo/Brasão */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
                <div className="w-full h-full relative">
                  <Image
                    src="/PREFEITURA.png"
                    alt="Brasão da Prefeitura"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-xs font-medium">
                <div>SECRETARIA MUNICIPAL</div>
                <div>00.257.738.513.00</div>
              </div>
            </div>
          </div>

          {rightElement && (
            <div className="text-white">
              {rightElement}
            </div>
          )}
        </div>

        {/* Title Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-blue-100 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Bottom text */}
        <div className="text-center mt-2">
          <div className="text-xs text-blue-100 uppercase tracking-wide">
            NÚCLEO DE APOIO AO DESENVOLVIMENTO EDUCACIONAL - NADE
          </div>
        </div>
      </div>
    </div>
  )
}