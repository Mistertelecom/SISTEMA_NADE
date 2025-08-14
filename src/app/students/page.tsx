'use client'

import { useEffect, useState } from 'react'
import { AuthWrapper } from '@/components/auth-wrapper'
import { MobileHeader } from '@/components/mobile-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Search, Users, Edit } from 'lucide-react'
import { StudentForm } from '@/components/student-form'
import logger from '@/lib/logger'

interface Student {
  _id: string
  name: string
  class: string
  grade: string
  enrollmentNumber: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  status: 'active' | 'inactive' | 'transferred'
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [searchTerm])

  const fetchStudents = async () => {
    const params = new URLSearchParams()
    try {
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '100')
      
      const response = await fetch(`/api/students?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setStudents(data.students || [])
      }
    } catch (error) {
      logger.error('Failed to fetch students', error as Error, { 
        method: 'GET',
        url: `/api/students?${params.toString()}`,
        searchTerm
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSaved = () => {
    setShowForm(false)
    setEditingStudent(null)
    fetchStudents()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'inactive': return 'text-gray-600 bg-gray-50'
      case 'transferred': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'transferred': return 'Transferido'
      default: return status
    }
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-slate-50 md:bg-white">
        {/* Mobile Header */}
        <MobileHeader 
          title="Cadastro de Alunos"
          rightElement={
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
              <p className="mt-2 text-gray-600">Gerencie os alunos cadastrados no sistema</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </div>

          {/* Form Modal - Mobile Optimized */}
          {(showForm || editingStudent) && (
            <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                  {editingStudent ? 'Editar Aluno' : 'Cadastro de Alunos'}
                </h2>
                <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
              </div>

              <StudentForm 
                student={editingStudent}
                onSuccess={handleStudentSaved}
                onCancel={() => {
                  setShowForm(false)
                  setEditingStudent(null)
                }}
              />
            </div>
          )}

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Nome
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome, turma ou matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-slate-200"
                  />
                </div>
              </div>
              
              {searchTerm && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="text-slate-600 border-slate-200"
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Students List - Mobile Optimized */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border-0 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {students.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border-0 p-8 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-base">
                    {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar primeiro aluno
                    </Button>
                  )}
                </div>
              ) : (
                students.map((student) => (
                  <div key={student._id} className="bg-white rounded-xl shadow-sm border-0 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                            {student.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(student.status)}`}>
                            {getStatusLabel(student.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          Matrícula: {student.enrollmentNumber}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStudent(student)}
                        className="ml-2"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </div>
                    
                    {/* Mobile Layout - Stacked */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Turma</p>
                        <p className="text-slate-800 font-medium">{student.class}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Série</p>
                        <p className="text-slate-800 font-medium">{student.grade}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Responsável</p>
                        <p className="text-slate-800 font-medium">{student.parentName || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    {/* Contact Info - Show on Expand */}
                    {(student.parentPhone || student.parentEmail) && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {student.parentPhone && (
                            <div>
                              <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Telefone</p>
                              <p className="text-slate-800 font-medium">{student.parentPhone}</p>
                            </div>
                          )}
                          {student.parentEmail && (
                            <div>
                              <p className="font-medium text-slate-500 text-xs uppercase tracking-wide">Email</p>
                              <p className="text-slate-800 font-medium break-all">{student.parentEmail}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-slate-400">
                      Cadastrado em: {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}