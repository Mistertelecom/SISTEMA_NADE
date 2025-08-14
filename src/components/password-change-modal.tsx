'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, Eye, EyeOff, Key } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface PasswordChangeModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordChangeModal({ user, isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.newPassword) {
      setError('Nova senha é obrigatória')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${user._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({ newPassword: '', confirmPassword: '' })
      } else {
        setError(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ newPassword: '', confirmPassword: '' })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Alterar Senha</h2>
              <p className="text-sm text-slate-500">{user.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              Nova Senha *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Digite a nova senha"
                disabled={loading}
                className="h-12 text-base border-slate-200 focus:border-blue-500 pr-12"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500">Mínimo de 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Confirmar Nova Senha *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirme a nova senha"
                disabled={loading}
                className="h-12 text-base border-slate-200 focus:border-blue-500 pr-12"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-slate-500 hover:text-slate-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto h-12 text-base border-slate-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Alterando...
                </div>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}