import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import logger from '@/lib/logger'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session = null
  let body = null
  let userId = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admin pode editar usuários
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params
    userId = id
    body = await request.json()
    const { name, email, role } = body

    if (!name || !email || !role) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, email e função' 
      }, { status: 400 })
    }

    // Validar role
    if (!['admin', 'coordinator', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'Função inválida' }, { status: 400 })
    }

    // Verificar se email já existe em outro usuário
    const existingUser = await User.findOne({ email, _id: { $ne: id } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
    }

    // Não permitir que admin se rebaixe se for o único admin
    const user = await User.findById(id)
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount === 1) {
        return NextResponse.json({ 
          error: 'Não é possível alterar a função do último administrador' 
        }, { status: 400 })
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    logger.error('Failed to update user', error as Error, { 
      userId: session?.user?.id,
      targetUserId: userId,
      method: 'PUT',
      url: `/api/users/${userId}`,
      email: body?.email
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session = null
  let userId = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admin pode excluir usuários
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params
    userId = id

    // Não permitir que admin se exclua
    if (id === session.user.id) {
      return NextResponse.json({ 
        error: 'Não é possível excluir seu próprio usuário' 
      }, { status: 400 })
    }

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Não permitir exclusão do último admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount === 1) {
        return NextResponse.json({ 
          error: 'Não é possível excluir o último administrador' 
        }, { status: 400 })
      }
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    logger.error('Failed to delete user', error as Error, { 
      userId: session?.user?.id,
      targetUserId: userId,
      method: 'DELETE',
      url: `/api/users/${userId}`
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}