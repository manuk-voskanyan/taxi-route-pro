// Mock storage for testing without Sanity
// This is temporary - replace with Sanity once configured

let mockUsers = []
let mockTrips = []
let mockMessages = []

// Generate mock IDs
function generateId() {
  return 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Mock user storage
export const mockUserStorage = {
  create: async (userData) => {
    const user = {
      ...userData,
      _id: generateId(),
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    }
    mockUsers.push(user)
    console.log('Mock: Created user', user._id)
    return user
  },

  findByEmail: async (email) => {
    console.log('🔍 Searching for user with email:', email)
    console.log('📋 Current users in mock storage:', mockUsers.map(u => u.email))
    const user = mockUsers.find(u => u.email === email)
    console.log('Mock: Finding user by email:', email, 'Found:', !!user)
    return user || null
  },

  findById: async (id) => {
    const user = mockUsers.find(u => u._id === id)
    return user || null
  },

  update: async (id, updates) => {
    const userIndex = mockUsers.findIndex(u => u._id === id)
    if (userIndex >= 0) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...updates,
        _updatedAt: new Date().toISOString()
      }
      return mockUsers[userIndex]
    }
    return null
  },

  getAll: async () => {
    return mockUsers.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      isActive: user.isActive,
      hasPassword: !!user.password,
      createdAt: user.createdAt
    }))
  }
}

// Mock trip storage
export const mockTripStorage = {
  create: async (tripData) => {
    const trip = {
      ...tripData,
      _id: generateId(),
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    }
    mockTrips.push(trip)
    console.log('Mock: Created trip', trip._id)
    return trip
  },

  findAll: async (filters = {}) => {
    let trips = [...mockTrips]
    
    if (filters.fromCity) {
      trips = trips.filter(t => 
        t.fromCity.toLowerCase().includes(filters.fromCity.toLowerCase())
      )
    }
    
    if (filters.toCity) {
      trips = trips.filter(t => 
        t.toCity.toLowerCase().includes(filters.toCity.toLowerCase())
      )
    }
    
    if (filters.departureDate) {
      trips = trips.filter(t => t.departureDate === filters.departureDate)
    }
    
    if (filters.status) {
      trips = trips.filter(t => t.status === filters.status)
    }

    // Add driver info (mock join)
    const tripsWithDrivers = await Promise.all(
      trips.map(async (trip) => {
        const driver = await mockUserStorage.findById(trip.driver?._ref || trip.driverId)
        return {
          ...trip,
          driver: driver ? {
            _id: driver._id,
            name: driver.name,
            avatar: driver.avatar || null,
            driverInfo: {
              ...driver.driverInfo,
              company: driver.driverInfo?.company || ''
            }
          } : null
        }
      })
    )

    console.log('Mock: Found trips', tripsWithDrivers.length)
    return tripsWithDrivers
  }
}

// Debug function to see current data
export const debugMockData = () => {
  console.log('=== MOCK DATA DEBUG ===')
  console.log('Users:', mockUsers.length)
  console.log('Trips:', mockTrips.length) 
  console.log('Messages:', mockMessages.length)
  console.log('=====================')
}
