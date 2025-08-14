'use client'

import { useEffect, useState } from 'react'
import { AuthWrapper } from '@/components/auth-wrapper'
import { MobileHeader } from '@/components/mobile-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Search, Filter, FileText, ChevronDown, Printer } from 'lucide-react'
import { OccurrenceForm } from '@/components/occurrence-form'
import { OccurrencePrint } from '@/components/occurrence-print'
import logger from '@/lib/logger'

interface Student {
  _id: string
  name: string
  class: string
  enrollmentNumber: string
}

interface Occurrence {
  _id: string
  type: string
  description: string
  date: string
  time: string
  location: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  student: Student
  reportedBy: { name: string }
  solicitante: string
  envolvidos: string[]
  motivos: string[]
  acoes: string[]
  conclusao: string
  observacoes: string
  createdAt: string
}

export default function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOccurrences()
  }, [searchTerm, typeFilter, statusFilter])

  const fetchOccurrences = async () => {
    const params = new URLSearchParams()
    if (typeFilter) params.append('type', typeFilter)
    if (statusFilter) params.append('status', statusFilter)
    
    try {      
      const response = await fetch(`/api/occurrences?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        let filtered = data.occurrences || []
        
        if (searchTerm) {
          filtered = filtered.filter((occ: Occurrence) => 
            occ.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occ.student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occ.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            occ.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setOccurrences(filtered)
      }
    } catch (error) {
      logger.error('Failed to fetch occurrences', error as Error, { 
        method: 'GET',
        url: `/api/occurrences?${params.toString()}`,
        searchTerm,
        typeFilter,
        statusFilter
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOccurrenceCreated = () => {
    setShowForm(false)
    fetchOccurrences()
  }

  const handlePrintOccurrence = (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence)
    setShowPrintModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'in_progress': return 'Em Andamento'
      case 'resolved': return 'Resolvido'
      case 'closed': return 'Fechado'
      default: return status
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return severity
    }
  }

  const occurrenceTypes = [
    'Atraso', 'Falta', 'Indisciplina', 'Comportamento inadequado',
    'Não fez tarefa', 'Sem material', 'Briga', 'Desrespeito ao professor',
    'Desrespeito aos colegas', 'Uso de celular', 'Saída da sala sem permissão', 'Outros'
  ]

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-slate-50 md:bg-white">
        {/* Mobile Header */}
        <MobileHeader 
          title="Registro de Ocorrência"
          rightElement={
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ocorrências</h1>
              <p className="mt-2 text-gray-600">Gerencie e visualize as ocorrências registradas</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ocorrência
            </Button>
          </div>

          {/* Form Modal - Mobile Optimized */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                  Registro de Ocorrência
                </h2>
                <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
              </div>

              <OccurrenceForm 
                onSuccess={handleOccurrenceCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Filters Section - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Buscar
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por aluno, tipo, descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-slate-200"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Tipo
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="type"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full h-12 px-3 py-2 text-base border border-slate-200 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="">Todos os tipos</option>
                      {occurrenceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-12 px-3 py-2 text-base border border-slate-200 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500/20 appearance-none"
                    >
                      <option value="">Todos os status</option>
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setTypeFilter('')
                      setStatusFilter('')
                    }}
                    className="w-full h-12 border-slate-200"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Occurrences List - Mobile Optimized */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border-0 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {occurrences.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border-0 p-8 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-base">
                    {searchTerm || typeFilter || statusFilter ? 'Nenhuma ocorrência encontrada' : 'Nenhuma ocorrência registrada'}
                  </p>
                  {!searchTerm && !typeFilter && !statusFilter && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar primeira ocorrência
                    </Button>
                  )}
                </div>
              ) : (
                occurrences.map((occurrence) => (
                  <div key={occurrence._id} className="bg-white rounded-xl shadow-sm border-0 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                            {occurrence.student?.name || occurrence.solicitante}
                          </h3>
                          <div className="flex gap-2 mt-1 sm:mt-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                              {getSeverityLabel(occurrence.severity)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(occurrence.status)}`}>
                              {getStatusLabel(occurrence.status)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          {occurrence.student ? `${occurrence.student.class} • Matrícula: ${occurrence.student.enrollmentNumber}` : 'Registro NADE'}
                        </p>
                      </div>
                      <div className="ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintOccurrence(occurrence)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Printer className="h-4 w-4" />
                          <span className="hidden sm:ml-2 sm:inline">Imprimir</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile Layout - Stacked */}
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Tipo</p>
                          <p className="text-slate-800 font-medium">{occurrence.type}</p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Local</p>
                          <p className="text-slate-800 font-medium">{occurrence.location}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Data e Hora</p>
                        <p className="text-slate-800 font-medium">{formatDate(occurrence.date)} às {occurrence.time}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                          {occurrence.conclusao ? 'Conclusão' : 'Descrição'}
                        </p>
                        <p className="text-slate-800 leading-relaxed">
                          {occurrence.conclusao || occurrence.description}
                        </p>
                      </div>
                      
                      {occurrence.motivos && occurrence.motivos.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Motivos</p>
                          <p className="text-slate-800">{occurrence.motivos.join(', ')}</p>
                        </div>
                      )}
                      
                      {occurrence.acoes && occurrence.acoes.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Ações Adotadas</p>
                          <p className="text-slate-800">{occurrence.acoes.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                      <span>Por: {occurrence.reportedBy.name}</span>
                      <span>{formatDate(occurrence.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Print Modal */}
          {showPrintModal && selectedOccurrence && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold text-slate-800">Imprimir Relatório NADE</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrintModal(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </Button>
                </div>
                <div className="p-6">
                  <OccurrencePrint occurrence={selectedOccurrence} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}