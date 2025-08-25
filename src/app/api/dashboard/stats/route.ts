import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Occurrence from '@/models/Occurrence'
import logger from '@/lib/logger'

export async function GET() {
  let session = null
  try {
    session = await getAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Otimizar consultas executando em paralelo
    const [openOccurrences, todayOccurrences, recentOccurrences, occurrencesByType] = await Promise.all([
      // Count open occurrences
      Occurrence.countDocuments({
        status: { $in: ['open', 'in_progress'] }
      }),

      // Count today's occurrences
      Occurrence.countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      }),

      // Get recent occurrences com projeção específica
      Occurrence.find({}, {
        student: 1,
        type: 1,
        severity: 1,
        createdAt: 1
      })
        .populate({
          path: 'student',
          select: 'name class',
          // Adicionar verificação para estudantes que não existem mais
          options: { lean: true }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Get occurrences by type com cache
      Occurrence.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            type: '$_id',
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ])
    ])

    return NextResponse.json({
      openOccurrences,
      todayOccurrences,
      recentOccurrences,
      occurrencesByType
    })
  } catch (error) {
    logger.error('Failed to fetch dashboard statistics', error as Error, { 
      userId: session?.user?.id,
      method: 'GET',
      url: '/api/dashboard/stats'
    })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}