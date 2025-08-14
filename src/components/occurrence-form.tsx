'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import logger from '@/lib/logger'

interface Student {
  _id: string
  name: string
  class: string
  enrollmentNumber: string
}

interface OccurrenceFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function OccurrenceForm({ onSuccess, onCancel }: OccurrenceFormProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [formData, setFormData] = useState({
    student: '',
    type: 'Indisciplina',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    
    // Campos específicos NADE
    solicitante: '',
    envolvidos: [''],
    motivos: [] as string[],
    acoes: [] as string[],
    conclusao: '',
    observacoes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(true)

  const motivosOptions = [
    'Indisciplina', 'Bullying', 'Palestra', 'Uso de fato', 'Porte de drogas',
    'Porte de objeto que causa perigo', 'Dano', 'Transporte escolar',
    'Reunião pedagógica', 'Uso da internet para discriminar ou medo/ameaças',
    'Ameaça', 'Aconselhamento', 'Treinamento', 'Lesão corporal',
    'Análise estrutural', 'Visita rotineira', 'Outro'
  ]

  const acoesOptions = [
    'Aconselhamento', 'Advertência', 'Suspensão', 'Transferência', 'Outro'
  ]

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?limit=1000')
      const data = await response.json()
      if (response.ok) {
        setStudents(data.students || [])
      }
    } catch (error) {
      logger.error('Failed to fetch students for occurrence form', error as Error, { 
        method: 'GET',
        url: '/api/students?limit=1000'
      })
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.solicitante || !formData.location) {
      setError('Solicitante e local são obrigatórios')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/occurrences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          envolvidos: formData.envolvidos.filter(e => e.trim() !== '')
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Erro ao criar ocorrência')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field: 'motivos' | 'acoes', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleEnvolvidoChange = (index: number, value: string) => {
    const newEnvolvidos = [...formData.envolvidos]
    newEnvolvidos[index] = value
    setFormData(prev => ({
      ...prev,
      envolvidos: newEnvolvidos
    }))
  }

  const addEnvolvido = () => {
    setFormData(prev => ({
      ...prev,
      envolvidos: [...prev.envolvidos, '']
    }))
  }

  const removeEnvolvido = (index: number) => {
    if (formData.envolvidos.length > 1) {
      setFormData(prev => ({
        ...prev,
        envolvidos: prev.envolvidos.filter((_, i) => i !== index)
      }))
    }
  }

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho NADE */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-800 mb-1">SECRETARIA DE EDUCAÇÃO E CULTURA</h1>
          <h2 className="text-lg text-slate-700 mb-1">Núcleo de Apoio Disciplinar Escolar - NADE</h2>
          <h3 className="text-base text-slate-600">Relatório de atendimento</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primeira linha: Local, Data, Hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="location" className="text-sm font-medium text-slate-700 mb-2 block">
                LOCAL:
              </Label>
              <Input
                id="location"
                placeholder="Local da ocorrência"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                disabled={loading}
                className="h-10 text-sm border-slate-300"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700 mb-2 block">
                DATA:
              </Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                disabled={loading}
                className="h-10 text-sm border-slate-300"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-slate-700 mb-2 block">
                HORA:
              </Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                disabled={loading}
                className="h-10 text-sm border-slate-300"
              />
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <Label htmlFor="solicitante" className="text-sm font-medium text-slate-700 mb-2 block">
              SOLICITANTE(S):
            </Label>
            <textarea
              id="solicitante"
              rows={2}
              placeholder="Nome do(s) solicitante(s)"
              required
              value={formData.solicitante}
              onChange={(e) => handleChange('solicitante', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Envolvidos */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              ENVOLVIDO(S):
            </Label>
            {formData.envolvidos.map((envolvido, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder={`Envolvido ${index + 1}`}
                  value={envolvido}
                  onChange={(e) => handleEnvolvidoChange(index, e.target.value)}
                  disabled={loading}
                  className="h-10 text-sm border-slate-300"
                />
                {formData.envolvidos.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeEnvolvido(index)}
                    className="h-10 px-3"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addEnvolvido}
              className="h-8 text-sm"
            >
              + Adicionar Envolvido
            </Button>
          </div>

          {/* Motivos */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              MOTIVO(S):
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {motivosOptions.map((motivo) => (
                <label key={motivo} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.motivos.includes(motivo)}
                    onChange={() => handleCheckboxChange('motivos', motivo)}
                    disabled={loading}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{motivo}</span>
                </label>
              ))}
            </div>
            {formData.motivos.includes('Outro') && (
              <Input
                placeholder="Especificar outro motivo..."
                className="mt-2 h-10 text-sm border-slate-300"
              />
            )}
          </div>

          {/* Ações */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-3 block">
              AÇÃO ADOTADA:
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {acoesOptions.map((acao) => (
                <label key={acao} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.acoes.includes(acao)}
                    onChange={() => handleCheckboxChange('acoes', acao)}
                    disabled={loading}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{acao}</span>
                </label>
              ))}
            </div>
            {formData.acoes.includes('Outro') && (
              <Input
                placeholder="Especificar outra ação..."
                className="mt-2 h-10 text-sm border-slate-300"
              />
            )}
          </div>

          {/* Conclusão */}
          <div>
            <Label htmlFor="conclusao" className="text-sm font-medium text-slate-700 mb-2 block">
              CONCLUSÃO:
            </Label>
            <textarea
              id="conclusao"
              rows={4}
              placeholder="Conclusão do caso..."
              value={formData.conclusao}
              onChange={(e) => handleChange('conclusao', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes" className="text-sm font-medium text-slate-700 mb-2 block">
              OBSERVAÇÕES:
            </Label>
            <textarea
              id="observacoes"
              rows={4}
              placeholder="Observações adicionais..."
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Aluno (opcional para NADE) */}
          <div>
            <Label htmlFor="student" className="text-sm font-medium text-slate-700 mb-2 block">
              ALUNO (Opcional):
            </Label>
            <select
              id="student"
              value={formData.student}
              onChange={(e) => handleChange('student', e.target.value)}
              disabled={loading}
              className="w-full h-10 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500/20"
            >
              <option value="">Nenhum aluno específico</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} - {student.class} ({student.enrollmentNumber})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto h-12 text-base border-slate-300"
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
                  Salvando...
                </div>
              ) : (
                'Registrar Ocorrência'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}