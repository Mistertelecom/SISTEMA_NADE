import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import logger from '@/lib/logger'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ 
        error: 'Email é obrigatório' 
      }, { status: 400 })
    }

    // Buscar usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se email não existir
      // Isso evita enumeration attacks
      logger.info('Password reset requested for non-existent email', { email })
      return NextResponse.json({ 
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' 
      })
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Salvar token no usuário
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: resetTokenExpiry,
    })

    // Em um ambiente de produção, você enviaria um email aqui
    // Por enquanto, vamos logar o token (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Password reset token generated (DEV ONLY)', {
        email,
        resetToken,
        resetUrl: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
      })
    }

    logger.info('Password reset requested', { 
      userId: user._id.toString(),
      email 
    })

    return NextResponse.json({ 
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação.'
    })

  } catch (error) {
    logger.error('Failed to process forgot password request', error as Error, {
      method: 'POST',
      url: '/api/auth/forgot-password'
    })
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}