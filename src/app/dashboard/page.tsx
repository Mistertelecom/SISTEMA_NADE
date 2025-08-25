'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import { AuthWrapper } from '@/components/auth-wrapper'
import { MobileHeader } from '@/components/mobile-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, AlertTriangle, Calendar, TrendingUp, Menu } from 'lucide-react'
import logger from '@/lib/logger'

interface DashboardStats {
  totalStudents: number
  totalOccurrences: number
  openOccurrences: number
  todayOccurrences: number
  recentOccurrences: Array<{
    _id: string
    type: string
    student: { name: string, class: string }
    createdAt: string
    severity: string
  }>
  occurrencesByType: Array<{
    type: string
    count: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalOccurrences: 0,
    openOccurrences: 0,
    todayOccurrences: 0,
    recentOccurrences: [],
    occurrencesByType: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }, [])

  const getSeverityLabel = useMemo(() => (severity: string) => {
    switch (severity) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return severity
    }
  }, [])

  const fetchDashboardData = useMemo(() => async () => {
    try {
      const [studentsRes, occurrencesRes, recentRes] = await Promise.all([
        fetch('/api/students?limit=1'),
        fetch('/api/occurrences?limit=1'),
        fetch('/api/dashboard/stats')
      ])

      const studentsData = await studentsRes.json()
      const occurrencesData = await occurrencesRes.json()
      const statsData = await recentRes.json()

      setStats({
        totalStudents: studentsData.pagination?.total || 0,
        totalOccurrences: occurrencesData.pagination?.total || 0,
        openOccurrences: statsData.openOccurrences || 0,
        todayOccurrences: statsData.todayOccurrences || 0,
        recentOccurrences: statsData.recentOccurrences || [],
        occurrencesByType: statsData.occurrencesByType || []
      })
    } catch (error) {
      logger.error('Failed to fetch dashboard data', error as Error, { 
        method: 'GET',
        urls: ['/api/students?limit=1', '/api/occurrences?limit=1', '/api/dashboard/stats']
      })
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <AuthWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-slate-50 md:bg-white">
        {/* Mobile Header */}
        <MobileHeader 
          title="Dashboard"
          showBackButton={false}
          rightElement={
            <Menu className="h-6 w-6 text-white" />
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Visão geral do sistema de ocorrências</p>
          </div>

          {/* Statistics Cards - Following JPEG Design */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalStudents}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Alunos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">
                  {stats.totalOccurrences}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Ocorrências
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">
                  {stats.openOccurrences}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Pendentes
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
                Ocorrências por Aluno
              </h3>
              <div className="space-y-3">
                {stats.recentOccurrences.slice(0, 4).map((occurrence, index) => (
                  <div key={occurrence._id} className="flex items-center">
                    <div className="w-2 h-12 rounded-full mr-3" 
                         style={{ backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'][index] }}>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">
                        {occurrence.student.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {occurrence.student.class}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-800">
                        {index + 1}
                      </div>
                      <div className="text-xs text-slate-500">
                        ocorrências
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart Representation */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
                Tipos de Ocorrências
              </h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <div className="w-32 h-32 rounded-full" style={{
                    background: `conic-gradient(
                      #3B82F6 0deg 120deg,
                      #F59E0B 120deg 240deg,
                      #10B981 240deg 360deg
                    )`
                  }}>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">
                          {Math.round((stats.occurrencesByType.reduce((acc, item) => acc + item.count, 0) / Math.max(1, stats.totalOccurrences)) * 100)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          Total
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {stats.occurrencesByType.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" 
                           style={{ backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'][index] }}>
                      </div>
                      <span className="text-sm text-slate-700">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Charts Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocorrências Recentes</CardTitle>
                <CardDescription>
                  Últimas ocorrências registradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOccurrences.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma ocorrência recente
                    </p>
                  ) : (
                    stats.recentOccurrences.map((occurrence) => (
                      <div key={occurrence._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{occurrence.student.name}</p>
                          <p className="text-sm text-gray-500">{occurrence.student.class}</p>
                          <p className="text-sm font-medium">{occurrence.type}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(occurrence.severity)}`}>
                            {getSeverityLabel(occurrence.severity)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(occurrence.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Detalhadas</CardTitle>
                <CardDescription>
                  Análise completa do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium">Total de Alunos</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stats.totalStudents}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="font-medium">Total de Ocorrências</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{stats.totalOccurrences}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                      <span className="font-medium">Abertas</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{stats.openOccurrences}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Hoje</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{stats.todayOccurrences}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}