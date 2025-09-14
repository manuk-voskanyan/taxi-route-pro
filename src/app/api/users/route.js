import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

// GET - Fetch registered users for home page display
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '8'

    // Query to get the last registered users, prioritizing those with profile pictures
    const query = `*[_type == "user"] | order(_createdAt desc) [0...${limit}] {
      _id,
      name,
      avatar{
        asset->{
          _id,
          url
        }
      },
      userType,
      _createdAt
    }`

    const users = await client.fetch(query)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
