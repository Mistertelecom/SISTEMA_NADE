import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Occurrence from '@/models/Occurrence'
import logger from '@/lib/logger'

export async function GET(request: NextRequest) {
  let session = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const query: Record<string, unknown> = {}
    
    if (studentId) {
      query.student = studentId
    }
    
    if (type) {
      query.type = type
    }
    
    if (status) {
      query.status = status
    }
    
    if (dateFrom || dateTo) {
      const dateQuery: Record<string, Date> = {}
      if (dateFrom) {
        dateQuery.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        dateQuery.$lte = new Date(dateTo)
      }
      query.date = dateQuery
    }

    const occurrences = await Occurrence.find(query)
      .populate('student', 'name class enrollmentNumber')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Occurrence.countDocuments(query)

    return NextResponse.json({
      occurrences,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Failed to fetch occurrences', error as Error, { 
      userId: session?.user?.id,
      method: 'GET',
      url: '/api/occurrences',
      query: { studentId: request.nextUrl.searchParams.get('studentId'), type: request.nextUrl.searchParams.get('type'), status: request.nextUrl.searchParams.get('status') }
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

    await dbConnect()

    body = await request.json()
    const { 
      student, type, description, date, time, location, severity,
      solicitante, envolvidos, motivos, acoes, conclusao, observacoes 
    } = body

    if (!solicitante || !location) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: solicitante e local' 
      }, { status: 400 })
    }

    const occurrence = await Occurrence.create({
      student: student || null,
      type: type || 'Indisciplina',
      description: description || conclusao || 'Registro NADE',
      date: new Date(date),
      time,
      location,
      severity: severity || 'medium',
      reportedBy: session.user.id,
      
      // Campos específicos NADE
      solicitante,
      envolvidos: envolvidos || [],
      motivos: motivos || [],
      acoes: acoes || [],
      conclusao: conclusao || '',
      observacoes: observacoes || '',
      
      // Campos legados para compatibilidade
      actions: acoes || []
    })

    const populatedOccurrence = await Occurrence.findById(occurrence._id)
      .populate('student', 'name class enrollmentNumber')
      .populate('reportedBy', 'name')

    return NextResponse.json({ occurrence: populatedOccurrence }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create occurrence', error as Error, { 
      userId: session?.user?.id,
      method: 'POST',
      url: '/api/occurrences',
      studentId: body?.student
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}