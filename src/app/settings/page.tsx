'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { AuthWrapper } from '@/components/auth-wrapper'
import { MobileHeader } from '@/components/mobile-header'
import { UserFormModal } from '@/components/user-form-modal'
import { PasswordChangeModal } from '@/components/password-change-modal'
import { DeleteUserModal } from '@/components/delete-user-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, User, Bell, Shield, Palette, ChevronRight, Save, Plus, Edit, Key, Trash2, Users } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'coordinator' | 'teacher'
  createdAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState({
    notifications: true,
    emailReports: false,
    autoBackup: true,
    darkMode: false,
    language: 'pt-BR'
  })
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setSaving] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState('')
  
  // Modals state
  const [userFormModal, setUserFormModal] = useState<{
    isOpen: boolean
    user?: User | null
  }>({ isOpen: false, user: null })
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean
    user?: User
  }>({ isOpen: false })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    user?: User
  }>({ isOpen: false })

  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || ''
      })
      
      // Carregar usuários se for admin
      if (isAdmin) {
        fetchUsers()
      }
    }
  }, [session, isAdmin])

  const fetchUsers = async () => {
    if (!isAdmin) return
    
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError('Erro ao carregar usuários')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleUserSuccess = () => {
    fetchUsers()
    setError('')
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleProfileChange = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      // You could show a success message here
    }, 1000)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'coordinator': return 'Coordenador'
      case 'teacher': return 'Professor'
      default: return role
    }
  }

  const settingsSections = [
    {
      title: 'Tipo de Ocorrência',
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      items: [
        'Comportamental',
        'Pedagógica',
        'Outras'
      ]
    },
    {
      title: 'Perfil',
      icon: User,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      items: [
        'Informações pessoais',
        'Preferências',
        'Segurança'
      ]
    }
  ]

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-slate-50 md:bg-white">
        {/* Mobile Header */}
        <MobileHeader 
          title="Configurações"
          rightElement={
            <Button
              size="sm"
              onClick={saveSettings}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          }
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Desktop Header - Hidden on Mobile */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="mt-2 text-gray-600">Personalize suas preferências do sistema</p>
            </div>
            <Button onClick={saveSettings} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>

          {/* Settings Sections - Mobile Design */}
          <div className="space-y-3">
            {settingsSections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border-0 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${section.bgColor} flex items-center justify-center`}>
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {section.items.length} opções disponíveis
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>

                {/* Expandable content */}
                <div className="mt-4 pl-13 space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">{item}</span>
                      <Switch
                        checked={settings.notifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                Perfil do Usuário
              </h3>
              <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{profile.name}</h4>
                  <p className="text-sm text-slate-500">{getRoleLabel(profile.role)}</p>
                  <p className="text-sm text-slate-400">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="h-12 text-base border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="h-12 text-base border-slate-200 focus:border-blue-500"
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Função
                </Label>
                <Input
                  id="role"
                  value={getRoleLabel(profile.role)}
                  className="h-12 text-base border-slate-200 bg-slate-50"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                Preferências do Sistema
              </h3>
              <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Notificações</p>
                  <p className="text-sm text-slate-500">Receber notificações do sistema</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Relatórios por E-mail</p>
                  <p className="text-sm text-slate-500">Enviar relatórios semanais por e-mail</p>
                </div>
                <Switch
                  checked={settings.emailReports}
                  onCheckedChange={(checked) => handleSettingChange('emailReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Backup Automático</p>
                  <p className="text-sm text-slate-500">Fazer backup automático dos dados</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Modo Escuro</p>
                  <p className="text-sm text-slate-500">Usar tema escuro da interface</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
            </div>
          </div>

          {/* User Management - Admin Only */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border-0 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                    Gestão de Usuários
                  </h3>
                  <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                </div>
                <Button
                  onClick={() => setUserFormModal({ isOpen: true, user: null })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Novo Usuário</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{user.name}</h4>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-red-100 text-red-700'
                                : user.role === 'coordinator'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {getRoleLabel(user.role)}
                            </span>
                            <span className="text-xs text-slate-400">
                              Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserFormModal({ isOpen: true, user })}
                            className="text-slate-600 border-slate-200"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:ml-2 sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPasswordModal({ isOpen: true, user })}
                            className="text-blue-600 border-blue-200"
                          >
                            <Key className="h-4 w-4" />
                            <span className="hidden sm:ml-2 sm:inline">Senha</span>
                          </Button>
                          {user._id !== session?.user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteModal({ isOpen: true, user })}
                              className="text-red-600 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:ml-2 sm:inline">Excluir</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Save Button - Mobile */}
          <div className="md:hidden">
            <Button 
              onClick={saveSettings} 
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>

        {/* Modals */}
        <UserFormModal
          user={userFormModal.user}
          isOpen={userFormModal.isOpen}
          onClose={() => setUserFormModal({ isOpen: false, user: null })}
          onSuccess={handleUserSuccess}
        />
        
        {passwordModal.user && (
          <PasswordChangeModal
            user={passwordModal.user}
            isOpen={passwordModal.isOpen}
            onClose={() => setPasswordModal({ isOpen: false })}
            onSuccess={handleUserSuccess}
          />
        )}
        
        {deleteModal.user && (
          <DeleteUserModal
            user={deleteModal.user}
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false })}
            onSuccess={handleUserSuccess}
          />
        )}
      </div>
    </AuthWrapper>
  )
}