import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth-helpers'

export async function POST(request) {
  try {
    const formData = await request.formData()
    console.log('Registration request received...')
    
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const userType = formData.get('userType')
    const phone = formData.get('phone')
    
    let driverInfo = null
    const carImageFiles = []
    
    if (userType === 'driver') {
      driverInfo = {
        licenseNumber: formData.get('licenseNumber'),
        carModel: formData.get('carModel'),
        carColor: formData.get('carColor'),
        plateNumber: formData.get('plateNumber'),
        company: formData.get('company') || ''
      }
      
      // Collect car image files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('carImage_') && value && value.size > 0 && value.type?.startsWith('image/')) {
          console.log(`Found car image: ${key}, size: ${value.size}, type: ${value.type}`)
          carImageFiles.push(value)
        }
      }
      console.log(`Found ${carImageFiles.length} car images`)
    }

    // Validate required fields
    if (!name || !email || !password || !userType || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email)
    const existingUser = await getUserByEmail(email)
    console.log('Existing user check result:', existingUser ? 'USER EXISTS' : 'USER NOT FOUND')
    
    if (existingUser) {
      console.log('❌ User already exists, rejecting registration')
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Validate driver-specific fields
    if (userType === 'driver' && (!driverInfo?.licenseNumber || !driverInfo?.carModel)) {
      return NextResponse.json(
        { error: 'Driver license number and car model are required for drivers' },
        { status: 400 }
      )
    }

    // Create new user
    console.log('🔄 Creating new user:', { email, userType, hasDriverInfo: !!driverInfo, imageCount: carImageFiles.length })
    
    const newUser = await createUser({
      name,
      email,
      password,
      userType,
      phone,
      driverInfo,
      carImages: carImageFiles
    })
    
    console.log('✅ User created successfully:', newUser._id)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          userType: newUser.userType
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('💥 Registration error:', error)
    console.error('Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: `Registration failed: ${error.message}` },
      { status: 500 }
    )
  }
}
