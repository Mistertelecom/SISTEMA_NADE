'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email primeiro')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || 'Erro ao solicitar recuperação de senha')
      }
    } catch (err) {
      setError('Erro ao solicitar recuperação de senha')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (result?.ok) {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Mobile/Tablet Layout */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center space-y-6 px-6 py-8 sm:px-8 sm:py-10">
            {/* Logo/Brasão da Prefeitura */}
            <div className="flex justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 relative">
                <Image
                  src="/PREFEITURA.png"
                  alt="Brasão da Prefeitura"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm text-blue-600 font-medium uppercase tracking-wide">
                PREFEITURA MUNICIPAL
              </div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">
                21.2.009.0389
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">
                ESTADO DE CONTRATAÇÃO PARA ATIVIDADES ESPECÍFICAS
              </div>
            </div>

            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mt-6">
              OCORRÊNCIA<br />ESCOLAR - NADE
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8 sm:pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="email" 
                    className="text-sm sm:text-base font-medium text-slate-700"
                  >
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 sm:h-14 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="password" 
                    className="text-sm sm:text-base font-medium text-slate-700"
                  >
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 sm:h-14 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{message}</AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 underline mb-4"
                  onClick={handleForgotPassword}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info - Hidden on small screens */}
        <div className="hidden sm:block text-center mt-6 text-xs text-slate-500 space-y-1">
          <div>Sistema de Ocorrências Escolares</div>
          <div>Núcleo de Apoio ao Desenvolvimento Educacional</div>
        </div>
      </div>
    </div>
  )
}