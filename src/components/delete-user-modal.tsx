'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, Trash2, AlertTriangle } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface DeleteUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteUserModal({ user, isOpen, onClose, onSuccess }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'coordinator': return 'Coordenador'
      case 'teacher': return 'Professor'
      default: return role
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h2>
              <p className="text-sm text-slate-500">Esta ação não pode ser desfeita</p>
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

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-2">Você está prestes a excluir o usuário:</p>
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-600">Função: {getRoleLabel(user.role)}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Atenção!</p>
                <ul className="space-y-1">
                  <li>• O usuário perderá acesso ao sistema imediatamente</li>
                  <li>• Todas as ocorrências registradas por ele serão mantidas</li>
                  <li>• Esta ação não pode ser desfeita</li>
                </ul>
              </div>
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
              onClick={handleDelete}
              disabled={loading}
              className="w-full sm:w-auto h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Excluindo...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Usuário
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}