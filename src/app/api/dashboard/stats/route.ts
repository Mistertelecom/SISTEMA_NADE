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

    // Count open occurrences
    const openOccurrences = await Occurrence.countDocuments({
      status: { $in: ['open', 'in_progress'] }
    })

    // Count today's occurrences
    const todayOccurrences = await Occurrence.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    })

    // Get recent occurrences
    const recentOccurrences = await Occurrence.find()
      .populate('student', 'name class')
      .sort({ createdAt: -1 })
      .limit(5)

    // Get occurrences by type
    const occurrencesByType = await Occurrence.aggregate([
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