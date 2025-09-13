import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserByEmail, updateUser } from '@/lib/auth-helpers'
import { client } from '@/sanity/lib/client'
import { mockUserStorage } from '@/lib/mock-storage'

// Check if we should use mock storage
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

// GET /api/profile - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Պահանջվում է նույնականացում' },
        { status: 401 }
      )
    }

    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Օգտագործողը չի գտնվել' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Չհաջողվեց բեռնել պրոֆիլը' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Պահանջվում է նույնականացում' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    const name = formData.get('name')
    const phone = formData.get('phone')
    const avatarFile = formData.get('avatar')
    
    const updates = {
      name,
      phone,
      updatedAt: new Date().toISOString()
    }

    // Handle avatar upload
    if (avatarFile && avatarFile.size > 0) {
      if (useMockStorage) {
        // For mock storage, create placeholder avatar
        updates.avatar = {
          _type: 'image',
          asset: {
            _id: `mock_avatar_${Date.now()}`,
            url: `https://via.placeholder.com/200x200?text=Avatar`
          }
        }
      } else {
        // Upload to Sanity
        try {
          const imageAsset = await client.assets.upload('image', avatarFile, {
            filename: `avatar_${session.user.id}_${avatarFile.name}`
          })
          updates.avatar = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id
            }
          }
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError)
          // Continue without avatar update if upload fails
        }
      }
    }

    // Handle driver-specific updates
    if (session.user.userType === 'driver') {
      const existingImagesStr = formData.get('existingImages')
      let existingImages = []
      
      try {
        if (existingImagesStr) {
          existingImages = JSON.parse(existingImagesStr)
        }
      } catch (e) {
        console.warn('Could not parse existing images:', e)
      }

      // Collect new car image files
      const newCarImageFiles = []
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('newCarImage_') && value && value.size > 0 && value.type?.startsWith('image/')) {
          newCarImageFiles.push(value)
        }
      }

      // Handle image uploads
      let allCarImages = [...existingImages]
      
      if (newCarImageFiles.length > 0) {
        if (useMockStorage) {
          // For mock storage, create placeholder images
          const mockNewImages = newCarImageFiles.map((file, index) => {
            const uniqueKey = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`
            return {
              _key: uniqueKey,
              _type: 'image',
              asset: {
                _id: `mock_new_${uniqueKey}`,
                url: `https://via.placeholder.com/400x300?text=Նոր+նկար+${index + 1}`
              }
            }
          })
          allCarImages = [...allCarImages, ...mockNewImages]
        } else {
          // Upload to Sanity
          for (let index = 0; index < newCarImageFiles.length; index++) {
            const imageFile = newCarImageFiles[index]
            try {
              const imageAsset = await client.assets.upload('image', imageFile, {
                filename: imageFile.name
              })
              const uniqueKey = `uploaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`
              allCarImages.push({
                _key: uniqueKey,
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: imageAsset._id
                }
              })
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError)
            }
          }
        }
      }

      updates.driverInfo = {
        licenseNumber: formData.get('licenseNumber'),
        carModel: formData.get('carModel'),
        carColor: formData.get('carColor'),
        plateNumber: formData.get('plateNumber'),
        company: formData.get('company') || '',
        carImages: allCarImages
      }
    }

    const updatedUser = await updateUser(session.user.id, updates)
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Չհաջողվեց թարմացնել պրոֆիլը' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Պրոֆիլը հաջողությամբ թարմացվել է',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Ներքին սերվերի սխալ' },
      { status: 500 }
    )
  }
}
