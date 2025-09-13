import bcrypt from 'bcryptjs'
import { client } from '@/sanity/lib/client'
import { mockUserStorage, debugMockData } from './mock-storage'

// Check if we should use mock storage (when Sanity isn't configured)
const useMockStorage = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
                      !process.env.SANITY_API_WRITE_TOKEN

export async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function createUser({ name, email, password, userType, phone, driverInfo, carImages = [], avatar = null }) {
  try {
    console.log(`Creating user using ${useMockStorage ? 'MOCK STORAGE' : 'SANITY'}`)
    
    const hashedPassword = await hashPassword(password)
    
    const userData = {
      _type: 'user',
      name,
      email,
      password: hashedPassword,
      userType,
      phone,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    if (userType === 'driver' && driverInfo) {
      if (useMockStorage) {
        // For mock storage, just store image info without actually uploading
        const mockImages = carImages.map((imageFile, index) => {
          const uniqueKey = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`
          return {
            _key: uniqueKey, // Add unique key for Sanity
            _type: 'image',
            asset: {
              _id: `mock_image_${uniqueKey}`,
              url: `https://via.placeholder.com/400x300?text=Car+Photo+${index + 1}` // Placeholder image
            }
          }
        })
        
        userData.driverInfo = {
          ...driverInfo,
          ...(mockImages.length > 0 && { carImages: mockImages })
        }
      } else {
        // Upload car images if provided and token is available
        const uploadedImages = []
        
        if (carImages.length > 0 && process.env.SANITY_API_WRITE_TOKEN) {
          for (let index = 0; index < carImages.length; index++) {
            const imageFile = carImages[index]
            try {
              const imageAsset = await client.assets.upload('image', imageFile, {
                filename: imageFile.name
              })
              const uniqueKey = `car_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`
              uploadedImages.push({
                _key: uniqueKey, // Add unique key for Sanity
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: imageAsset._id
                }
              })
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError)
              // Continue with other images if one fails
            }
          }
        }

        userData.driverInfo = {
          ...driverInfo,
          ...(uploadedImages.length > 0 && { carImages: uploadedImages })
        }
      }
    }

    console.log('Creating user with data:', {
      ...userData,
      password: '[HIDDEN]' // Don't log password
    })
    
    let newUser
    if (useMockStorage) {
      newUser = await mockUserStorage.create(userData)
      debugMockData()
    } else {
      newUser = await client.create(userData)
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  } catch (error) {
    console.error('Error creating user:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw new Error(`Failed to create user: ${error.message}`)
  }
}

export async function getUserByEmail(email) {
  try {
    if (useMockStorage) {
      const user = await mockUserStorage.findByEmail(email)
      return user
    } else {
      const user = await client.fetch(
        `*[_type == "user" && email == $email][0]{
          _id,
          name,
          email,
          userType,
          phone,
          isActive,
          avatar {
            asset->{ _id, url }
          },
          driverInfo {
            licenseNumber,
            carModel,
            carColor,
            plateNumber,
            company,
            rating,
            carImages[]{ 
              _key,
              asset->{ _id, url } 
            }
          },
          createdAt
        }`,
        { email }
      )
      return user
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getUserById(id) {
  try {
    if (useMockStorage) {
      const user = await mockUserStorage.findById(id)
      return user
    } else {
      const user = await client.fetch(
        `*[_type == "user" && _id == $id][0]{
          _id,
          name,
          email,
          userType,
          phone,
          isActive,
          avatar {
            asset->{ _id, url }
          },
          driverInfo {
            licenseNumber,
            carModel,
            carColor,
            plateNumber,
            company,
            rating,
            carImages[]{ 
              _key,
              asset->{ _id, url } 
            }
          },
          createdAt
        }`,
        { id }
      )
      return user
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function updateUser(userId, updates) {
  try {
    if (useMockStorage) {
      const updatedUser = await mockUserStorage.update(userId, updates)
      return updatedUser
    } else {
      const updatedUser = await client.patch(userId).set(updates).commit()
      return updatedUser
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}
