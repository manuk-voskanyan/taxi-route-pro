'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout'

export default function Profile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: '',
    avatar: null,
    driverInfo: {
      licenseNumber: '',
      carModel: '',
      carColor: '',
      plateNumber: '',
      company: '',
      carImages: []
    }
  })

  const [carImages, setCarImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchProfile()
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (response.ok) {
        setProfileData(data.user)
        
        // Set avatar preview URL
        if (data.user.avatar?.asset?.url || data.user.avatar?.url) {
          setAvatarPreviewUrl(data.user.avatar.asset?.url || data.user.avatar.url)
        }
        
        // Set car images preview URLs
        if (data.user.driverInfo?.carImages) {
          const carImageUrls = data.user.driverInfo.carImages.map(img => img.asset?.url || img.url).filter(url => url)
          console.log('Car images found:', data.user.driverInfo.carImages.length, 'URLs:', carImageUrls)
          setImagePreviewUrls(carImageUrls)
        }
      } else {
        setError(data.error || 'Չհաջողվեց բեռնել պրոֆիլը')
      }
    } catch (error) {
      setError('Կապի խնդիր: Խնդրում ենք նորից փորձել:')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('driver.')) {
      const driverField = name.replace('driver.', '')
      setProfileData({
        ...profileData,
        driverInfo: {
          ...profileData.driverInfo,
          [driverField]: value
        }
      })
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      })
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + carImages.length > 5) {
      setError('Դուք կարող եք վերբեռնել առավելագույնը 5 մեքենայի նկար')
      return
    }

    const newImages = [...carImages, ...files]
    setCarImages(newImages)

    // Create preview URLs
    const previewUrls = [...imagePreviewUrls, ...files.map(file => URL.createObjectURL(file))]
    setImagePreviewUrls(previewUrls)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeAvatar = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl)
    }
    setAvatarFile(null)
    setAvatarPreviewUrl('')
    setProfileData({
      ...profileData,
      avatar: null
    })
  }

  const removeImage = (index) => {
    // Remove from new uploads if it exists
    if (index >= (profileData.driverInfo?.carImages?.length || 0)) {
      const newImageIndex = index - (profileData.driverInfo?.carImages?.length || 0)
      const newImages = carImages.filter((_, i) => i !== newImageIndex)
      setCarImages(newImages)
    }

    // Remove from preview URLs
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImagePreviewUrls(newPreviewUrls)

    // Remove from existing images
    if (index < (profileData.driverInfo?.carImages?.length || 0)) {
      const newExistingImages = profileData.driverInfo.carImages.filter((_, i) => i !== index)
      setProfileData({
        ...profileData,
        driverInfo: {
          ...profileData.driverInfo,
          carImages: newExistingImages
        }
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const formDataToSend = new FormData()
      
      // Add basic profile data
      formDataToSend.append('name', profileData.name)
      formDataToSend.append('phone', profileData.phone)
      
      // Add avatar if uploaded
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile)
      }

      // Add driver-specific data
      if (profileData.userType === 'driver') {
        formDataToSend.append('licenseNumber', profileData.driverInfo.licenseNumber)
        formDataToSend.append('carModel', profileData.driverInfo.carModel)
        formDataToSend.append('carColor', profileData.driverInfo.carColor)
        formDataToSend.append('plateNumber', profileData.driverInfo.plateNumber)
        formDataToSend.append('company', profileData.driverInfo.company)
        
        // Add new car images
        carImages.forEach((image, index) => {
          formDataToSend.append(`newCarImage_${index}`, image)
        })

        // Keep track of existing images
        if (profileData.driverInfo.carImages) {
          formDataToSend.append('existingImages', JSON.stringify(profileData.driverInfo.carImages))
        }
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Պրոֆիլը հաջողությամբ թարմացվել է')
        setIsEditing(false)
        setCarImages([])
        // Update session if name or avatar changed
        const sessionUpdates = {}
        if (profileData.name !== session.user.name) {
          sessionUpdates.name = profileData.name
        }
        
        // Check if avatar was updated
        const newAvatarUrl = data.user.avatar?.asset?.url || data.user.avatar?.url
        const currentAvatarUrl = session.user.image || session.user.avatar?.asset?.url || session.user.avatar?.url
        if (newAvatarUrl !== currentAvatarUrl) {
          sessionUpdates.image = newAvatarUrl
        }
        
        if (Object.keys(sessionUpdates).length > 0) {
          await update(sessionUpdates)
        }
        
        await fetchProfile() // Refresh profile data
      } else {
        setError(data.error || 'Չհաջողվեց թարմացնել պրոֆիլը')
      }
    } catch (error) {
      setError('Կապի խնդիր: Խնդրում ենք նորից փորձել:')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Բեռնում է պրոֆիլը...</div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Իմ պրոֆիլը</h1>
                  <p className="text-gray-600">Դիտել և խմբագրել ձեր անձնական տեղեկությունները</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    profileData.userType === 'driver' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {profileData.userType === 'driver' ? 'Վարորդ' : 'Ուղևոր'}
                  </span>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Խմբագրել
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setError('')
                        setSuccess('')
                        fetchProfile() // Reset data
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Չեղարկել
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-6">
                  {success}
                </div>
              )}

              {/* Avatar Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Պրոֆիլի նկար</h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {avatarPreviewUrl || profileData.avatar?.asset?.url ? (
                      <img
                        src={avatarPreviewUrl || profileData.avatar?.asset?.url}
                        alt="Պրոֆիլի նկար"
                        className="w-24 h-24 object-cover rounded-full border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {isEditing && (avatarPreviewUrl || profileData.avatar) && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Նոր պրոֆիլի նկար
                      </label>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Վերբեռնել նկար
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG մինչև 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Հիմնական տեղեկություններ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Անուն *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Ձեր անունը"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Էլ․ հասցե
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Էլ․ հասցեն չի կարող փոխվել</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Հեռախոսահամար *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="+374xxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              {profileData.userType === 'driver' && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Վարորդի տեղեկություններ</h2>
                  <div className="bg-blue-50 p-6 rounded-lg space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Նույնականացման համար *
                        </label>
                        <input
                          type="text"
                          name="driver.licenseNumber"
                          value={profileData.driverInfo?.licenseNumber || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                          }`}
                          placeholder="DL123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Մեքենայի մոդել *
                        </label>
                        <input
                          type="text"
                          name="driver.carModel"
                          value={profileData.driverInfo?.carModel || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                          }`}
                          placeholder="Toyota Camry 2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Մեքենայի գույն
                        </label>
                        <input
                          type="text"
                          name="driver.carColor"
                          value={profileData.driverInfo?.carColor || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                          }`}
                          placeholder="Սպիտակ"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Պետհամար
                        </label>
                        <input
                          type="text"
                          name="driver.plateNumber"
                          value={profileData.driverInfo?.plateNumber || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                            !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                          }`}
                          placeholder="00AA000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ընկերության անվանում (ոչ պարտադիր)
                      </label>
                      <input
                        type="text"
                        name="driver.company"
                        value={profileData.driverInfo?.company || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          !isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                        }`}
                        placeholder="օր․ Քաղաքային տաքսի ՍՊԸ"
                      />
                    </div>

                    {/* Car Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Մեքենայի նկարներ (առավելագույնը 5)
                      </label>
                      
                      {/* Current Images */}
                      {imagePreviewUrls.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Մեքենայի նկար ${index + 1}`}
                                className={`w-full h-50 object-cover rounded-lg border border-gray-200 ${
                                  !isEditing ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105' : ''
                                }`}
                                onClick={!isEditing ? () => {
                                  // Open image in modal when not editing
                                  window.open(url, '_blank')
                                } : undefined}
                              />
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500">Մեքենայի նկարներ չեն գտնվել</p>
                          {!isEditing && (
                            <p className="text-xs text-gray-400 mt-2">Սեղմեք "Խմբագրել"՝ նկարներ ավելացնելու համար</p>
                          )}
                        </div>
                      )}

                      {/* Upload New Images */}
                      {isEditing && imagePreviewUrls.length < 5 && (
                        <div className="mt-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            <label className="cursor-pointer">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="text-sm text-gray-600 mb-2">Վերբեռնել նոր նկարներ</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF մինչև 10MB</p>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={imagePreviewUrls.length >= 5}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setError('')
                      setSuccess('')
                      fetchProfile()
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Չեղարկել
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Պահպանում...' : 'Պահպանել'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
