'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Layout } from '@/components/layout'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'passenger',
    // Driver specific fields
    licenseNumber: '',
    carModel: '',
    carColor: '',
    plateNumber: '',
    company: ''
  })
  const [carImages, setCarImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Cleanup image preview URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviewUrls])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + carImages.length > 5) {
      setError('You can upload maximum 5 car images')
      return
    }

    const newImages = [...carImages, ...files]
    setCarImages(newImages)

    // Create preview URLs
    const previewUrls = newImages.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(previewUrls)
  }

  const removeImage = (index) => {
    const newImages = carImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    // Clean up the URL object
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setCarImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate driver fields
    if (formData.userType === 'driver' && (!formData.licenseNumber || !formData.carModel)) {
      setError('License number and car model are required for drivers')
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Add basic user data
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('userType', formData.userType)

      // Add driver-specific data
      if (formData.userType === 'driver') {
        formDataToSend.append('licenseNumber', formData.licenseNumber)
        formDataToSend.append('carModel', formData.carModel)
        formDataToSend.append('carColor', formData.carColor)
        formDataToSend.append('plateNumber', formData.plateNumber)
        formDataToSend.append('company', formData.company)
        
        // Add car images
        carImages.forEach((image, index) => {
          formDataToSend.append(`carImage_${index}`, image)
        })
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Registration successful, attempting sign in...')
        // Registration successful, sign in the user
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          console.log('✅ Sign in successful, redirecting...')
          if (formData.userType === 'driver') {
            router.push('/create-trip')
          } else {
            router.push('/trips')
          }
        } else {
          console.log('❌ Sign in failed after registration, redirecting to signin page')
          router.push('/auth/signin')
        }
      } else {
        console.error('❌ Registration failed:', data)
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-blue-600 text-white rounded-lg p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Ստեղծել ձեր հաշիվը
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Կամ{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              մուտք գործել ձեր գոյություն ունեցող հաշիվ
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ես եմ:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex cursor-pointer rounded-lg px-5 py-4 border-2 focus:outline-none hover:border-blue-300 transition-colors ${formData.userType === 'passenger' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="passenger"
                      checked={formData.userType === 'passenger'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Ուղևոր</div>
                        <div className="text-gray-500">Փնտրում եմ ճանապարհ</div>
                      </div>
                    </div>
                  </label>
                  <label className={`relative flex cursor-pointer rounded-lg px-5 py-4 border-2 focus:outline-none hover:border-blue-300 transition-colors ${formData.userType === 'driver' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="userType"
                      value="driver"
                      checked={formData.userType === 'driver'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Վարորդ</div>
                        <div className="text-gray-500">Առաջարկում եմ ճանապարհ</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Driver-specific fields */}
              {formData.userType === 'driver' && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Driver Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        License Number *
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        required={formData.userType === 'driver'}
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="DL123456789"
                      />
                    </div>
                    <div>
                      <label htmlFor="carModel" className="block text-sm font-medium text-gray-700">
                        Car Model *
                      </label>
                      <input
                        id="carModel"
                        name="carModel"
                        type="text"
                        required={formData.userType === 'driver'}
                        value={formData.carModel}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Toyota Camry 2020"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="carColor" className="block text-sm font-medium text-gray-700">
                        Car Color
                      </label>
                      <input
                        id="carColor"
                        name="carColor"
                        type="text"
                        value={formData.carColor}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="White"
                      />
                    </div>
                    <div>
                      <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">
                        License Plate
                      </label>
                      <input
                        id="plateNumber"
                        name="plateNumber"
                        type="text"
                        value={formData.plateNumber}
                        onChange={handleChange}
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="ABC-1234"
                      />
                    </div>
                  </div>
                  
                  {/* Company field */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company Name (Optional)
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., City Taxi LLC, Independent Driver"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty if you're an independent driver</p>
                  </div>
                  
                  {/* Car Images Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Car Images (up to 5)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="carImages"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload car photos</span>
                            <input
                              id="carImages"
                              name="carImages"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={carImages.length >= 5}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-3 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Car preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
