import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Student from '@/models/Student'
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
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { class: { $regex: search, $options: 'i' } },
          { enrollmentNumber: { $regex: search, $options: 'i' } },
        ]
      }
    }

    const students = await Student.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Student.countDocuments(query)

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Failed to fetch students', error as Error, { 
      userId: session?.user?.id,
      method: 'GET',
      url: '/api/students',
      search: request.nextUrl.searchParams.get('search')
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

    if (!['admin', 'coordinator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permissão insuficiente' }, { status: 403 })
    }

    await dbConnect()

    body = await request.json()
    const { name, class: studentClass, grade, enrollmentNumber, parentName, parentPhone, parentEmail, birthDate } = body

    if (!name || !studentClass || !grade || !enrollmentNumber) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, turma, série e matrícula' }, { status: 400 })
    }

    const existingStudent = await Student.findOne({ enrollmentNumber })
    if (existingStudent) {
      return NextResponse.json({ error: 'Número de matrícula já existe' }, { status: 400 })
    }

    const student = await Student.create({
      name,
      class: studentClass,
      grade,
      enrollmentNumber,
      parentName,
      parentPhone,
      parentEmail,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    })

    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create student', error as Error, { 
      userId: session?.user?.id,
      method: 'POST',
      url: '/api/students',
      enrollmentNumber: body?.enrollmentNumber
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}