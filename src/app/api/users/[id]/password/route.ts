import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcrypt'
import logger from '@/lib/logger'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let session = null
  let userId = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admin pode alterar senhas de outros usuários
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params
    userId = id
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json({ error: 'Nova senha é obrigatória' }, { status: 400 })
    }

    // Validar senha
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Verificar se usuário existe
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.findByIdAndUpdate(id, { password: hashedPassword })

    return NextResponse.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    logger.error('Failed to update user password', error as Error, { 
      userId: session?.user?.id,
      targetUserId: userId,
      method: 'PUT',
      url: `/api/users/${userId}/password`
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}