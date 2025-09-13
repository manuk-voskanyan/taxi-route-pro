import { NextResponse } from 'next/server'
import { mockUserStorage } from '@/lib/mock-storage'

export async function GET() {
  try {
    // Get all users from mock storage
    const users = await mockUserStorage.getAll()

    return NextResponse.json({
      message: 'Debug: Users in mock storage',
      totalUsers: users.length,
      users,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug users error:', error)
    return NextResponse.json(
      { error: 'Failed to debug users' },
      { status: 500 }
    )
  }
}
