import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Student from '@/models/Student'
import logger from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session = null
  let body = null
  let studentId = null
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
    const { name, class: studentClass, grade, enrollmentNumber, parentName, parentPhone, parentEmail, birthDate, status } = body

    if (!name || !studentClass || !grade || !enrollmentNumber) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, turma, série e matrícula' }, { status: 400 })
    }

    // Check if enrollment number is already used by another student
    const { id } = await params
    studentId = id
    const existingStudent = await Student.findOne({ 
      enrollmentNumber, 
      _id: { $ne: id } 
    })
    
    if (existingStudent) {
      return NextResponse.json({ error: 'Número de matrícula já existe' }, { status: 400 })
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        class: studentClass,
        grade,
        enrollmentNumber,
        parentName,
        parentPhone,
        parentEmail,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        status,
      },
      { new: true }
    )

    if (!updatedStudent) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ student: updatedStudent })
  } catch (error) {
    logger.error('Failed to update student', error as Error, { 
      userId: session?.user?.id,
      method: 'PUT',
      url: `/api/students/${studentId}`,
      enrollmentNumber: body?.enrollmentNumber
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session = null
  let studentId = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas administradores podem excluir alunos' }, { status: 403 })
    }

    await dbConnect()

    const { id } = await params
    studentId = id
    const deletedStudent = await Student.findByIdAndDelete(id)

    if (!deletedStudent) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Aluno excluído com sucesso' })
  } catch (error) {
    logger.error('Failed to delete student', error as Error, { 
      userId: session?.user?.id,
      method: 'DELETE',
      url: `/api/students/${studentId}`,
      studentId
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}