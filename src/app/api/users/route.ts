import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcrypt'
import logger from '@/lib/logger'

export async function GET() {
  let session = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admin pode listar usuários
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    const users = await User.find({})
      .select('-password') // Não retornar senha
      .sort({ createdAt: -1 })

    return NextResponse.json({ users })
  } catch (error) {
    logger.error('Failed to fetch users', error as Error, {
      userId: session?.user?.id,
      method: 'GET',
      url: '/api/users'
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let session = null
  let body = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas admin pode criar usuários
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    body = await request.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: nome, email, senha e função' 
      }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
    }

    // Validar role
    if (!['admin', 'coordinator', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'Função inválida' }, { status: 400 })
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    // Retornar usuário sem senha
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create user', error as Error, {
      userId: session?.user?.id,
      method: 'POST',
      url: '/api/users',
      email: body?.email
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}