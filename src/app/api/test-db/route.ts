import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('Testing database connection...')
    
    await dbConnect()
    const connectTime = Date.now() - startTime
    console.log(`Database connected in ${connectTime}ms`)
    
    const userCount = await User.countDocuments()
    const queryTime = Date.now() - startTime
    console.log(`Query completed in ${queryTime}ms, found ${userCount} users`)
    
    return NextResponse.json({
      success: true,
      connectTime,
      queryTime,
      userCount,
      totalTime: Date.now() - startTime
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTime: Date.now() - startTime
    }, { status: 500 })
  }
}