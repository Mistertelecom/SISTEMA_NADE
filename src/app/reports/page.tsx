'use client'

import { useEffect, useState } from 'react'
import { AuthWrapper } from '@/components/auth-wrapper'
import { MobileHeader } from '@/components/mobile-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, Calendar, Filter, ChevronDown } from 'lucide-react'
import logger from '@/lib/logger'

interface Occurrence {
  _id: string
  type: string
  description: string
  date: string
  time: string
  location: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  student: {
    name: string
    class: string
    enrollmentNumber: string
  }
  reportedBy: { name: string }
  createdAt: string
}

export default function ReportsPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
    status: ''
  })

  useEffect(() => {
    fetchOccurrences()
  }, [filters])

  const fetchOccurrences = async () => {
    const params = new URLSearchParams()
    try {
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/occurrences?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setOccurrences(data.occurrences || [])
      }
    } catch (error) {
      logger.error('Failed to fetch occurrences for reports', error as Error, { 
        method: 'GET', 
        url: `/api/occurrences?${params.toString()}`,
        filters 
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      type: '',
      status: ''
    })
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-slate-50 md:bg-white">
        {/* Mobile Header */}
        <MobileHeader 
          title="Relatórios"
          rightElement={
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
              <p className="mt-2 text-gray-600">Visualize e exporte relatórios de ocorrências</p>
            </div>
            <Button onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                Filtros
              </h3>
              <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">
                    Data Inicial
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="h-12 text-base border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700">
                    Data Final
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="h-12 text-base border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-slate-700">
                    Tipo
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="type"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
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
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
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
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-slate-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border-0 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                  Resultados ({occurrences.length})
                </h3>
                {occurrences.length > 0 && (
                  <div className="text-sm text-slate-500">
                    {filters.dateFrom && filters.dateTo ? 
                      `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}` : 
                      'Todos os períodos'
                    }
                  </div>
                )}
              </div>

              {occurrences.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-base">
                    Nenhuma ocorrência encontrada para os filtros selecionados
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {occurrences.map((occurrence) => (
                    <div key={occurrence._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-800">
                              {occurrence.student.name}
                            </h4>
                            <span className="text-sm text-slate-500">
                              {occurrence.student.class}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                              {getSeverityLabel(occurrence.severity)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {occurrence.type}
                          </p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          <div>{formatDate(occurrence.date)}</div>
                          <div>{occurrence.time}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Local:</span> {occurrence.location}
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-3">
                        <span className="font-medium">Descrição:</span> {occurrence.description}
                      </div>
                      
                      <div className="text-xs text-slate-400 border-t border-slate-100 pt-2">
                        Relatado por {occurrence.reportedBy.name} em {formatDate(occurrence.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}