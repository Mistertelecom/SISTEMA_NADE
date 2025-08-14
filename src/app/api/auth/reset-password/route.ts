import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import logger from '@/lib/logger'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Token e senha são obrigatórios' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      }, { status: 400 })
    }

    // Hash do token para comparar com o banco
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Buscar usuário com token válido e não expirado
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    })

    if (!user) {
      logger.warn('Invalid or expired password reset token used', { 
        token: hashedToken.slice(0, 8) + '...' // Log apenas parte do token
      })
      return NextResponse.json({ 
        error: 'Token inválido ou expirado' 
      }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar senha e remover tokens de reset
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    })

    logger.info('Password reset successful', { 
      userId: user._id.toString(),
      email: user.email
    })

    return NextResponse.json({ 
      message: 'Senha redefinida com sucesso!' 
    })

  } catch (error) {
    logger.error('Failed to reset password', error as Error, {
      method: 'POST',
      url: '/api/auth/reset-password'
    })
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}