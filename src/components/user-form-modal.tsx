'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, Eye, EyeOff } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'coordinator' | 'teacher'
  createdAt: string
}

interface UserFormModalProps {
  user?: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserFormModal({ user, isOpen, onClose, onSuccess }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher' as 'admin' | 'coordinator' | 'teacher'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'coordinator', label: 'Coordenador' },
    { value: 'teacher', label: 'Professor' }
  ]

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'teacher'
      })
    }
    setError('')
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios')
      setLoading(false)
      return
    }

    if (!user && !formData.password) {
      setError('Senha é obrigatória para novos usuários')
      setLoading(false)
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const url = user ? `/api/users/${user._id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'
      
      const body: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }

      // Incluir senha apenas se foi preenchida
      if (formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || `Erro ao ${user ? 'atualizar' : 'criar'} usuário`)
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nome Completo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@exemplo.com"
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-slate-700">
              Função *
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'coordinator' | 'teacher' }))}
              disabled={loading}
              className="w-full h-12 px-3 py-2 text-base border border-slate-200 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500/20"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              {user ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Digite a senha"
                disabled={loading}
                className="h-12 text-base border-slate-200 focus:border-blue-500 pr-12"
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
          </div>

          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirmar Senha *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme a senha"
                  disabled={loading}
                  className="h-12 text-base border-slate-200 focus:border-blue-500 pr-12"
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
          )}

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  {user ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                user ? 'Atualizar' : 'Criar Usuário'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}