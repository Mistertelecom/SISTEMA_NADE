'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

interface Student {
  _id: string
  name: string
  class: string
  grade: string
  enrollmentNumber: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  birthDate?: string
  status: 'active' | 'inactive' | 'transferred'
}

interface StudentFormProps {
  student?: Student | null
  onSuccess: () => void
  onCancel: () => void
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    class: student?.class || '',
    grade: student?.grade || '',
    enrollmentNumber: student?.enrollmentNumber || '',
    parentName: student?.parentName || '',
    parentPhone: student?.parentPhone || '',
    parentEmail: student?.parentEmail || '',
    birthDate: student?.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
    status: student?.status || 'active' as 'active' | 'inactive' | 'transferred',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name || !formData.class || !formData.grade || !formData.enrollmentNumber) {
      setError('Campos obrigatórios: nome, turma, série e matrícula')
      setLoading(false)
      return
    }

    try {
      const url = student ? `/api/students/${student._id}` : '/api/students'
      const method = student ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || `Erro ao ${student ? 'atualizar' : 'criar'} aluno`)
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Information - Mobile First */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
            Nome
          </Label>
          <Input
            id="name"
            placeholder="Lucas Martins"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={loading}
            className="h-12 text-base border-slate-200 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class" className="text-sm font-medium text-slate-700">
              Turma
            </Label>
            <Input
              id="class"
              placeholder="Ex: A, B, C, 1A, 2B..."
              required
              value={formData.class}
              onChange={(e) => handleChange('class', e.target.value)}
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium text-slate-700">
              Série
            </Label>
            <Input
              id="grade"
              placeholder="Ex: 1° Ano, 5ª Série"
              required
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollmentNumber" className="text-sm font-medium text-slate-700">
            Matrícula
          </Label>
          <Input
            id="enrollmentNumber"
            placeholder="Digite o número da matrícula"
            required
            value={formData.enrollmentNumber}
            onChange={(e) => handleChange('enrollmentNumber', e.target.value)}
            disabled={loading}
            className="h-12 text-base border-slate-200 focus:border-blue-500"
          />
        </div>

        {/* Additional Information - Collapsible on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium text-slate-700">
              Data de Nascimento
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-slate-700">
              Status
            </Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={loading}
              className="flex h-12 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="transferred">Transferido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parent Information - Styled like JPEG */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
          Dados do Responsável
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentName" className="text-sm font-medium text-slate-700">
              Nome do Responsável
            </Label>
            <Input
              id="parentName"
              placeholder="Nome completo do responsável"
              value={formData.parentName}
              onChange={(e) => handleChange('parentName', e.target.value)}
              disabled={loading}
              className="h-12 text-base border-slate-200 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentPhone" className="text-sm font-medium text-slate-700">
                Telefone
              </Label>
              <Input
                id="parentPhone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.parentPhone}
                onChange={(e) => handleChange('parentPhone', e.target.value)}
                disabled={loading}
                className="h-12 text-base border-slate-200 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.parentEmail}
                onChange={(e) => handleChange('parentEmail', e.target.value)}
                disabled={loading}
                className="h-12 text-base border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Mobile Optimized Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
              {student ? 'Atualizando...' : 'Cadastrando...'}
            </div>
          ) : (
            student ? 'Atualizar' : 'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  )
}