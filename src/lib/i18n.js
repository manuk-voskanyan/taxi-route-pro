'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Create context
const I18nContext = createContext()

// Language translations
const translations = {
  hy: {
    // Navigation
    home: 'Գլխավոր',
    trips: 'Ճանապարհորդություններ',
    myTrips: 'Իմ ճանապարհորդությունները',
    messages: 'Նամակներ',
    profile: 'Պրոֆիլ',
    createTrip: 'Ստեղծել ճանապարհորդություն',
    signIn: 'Մուտք',
    signUp: 'Գրանցում',
    signOut: 'Ելք',

    // User related
    hello: 'Բարև, {name}',
    driver: 'Վարորդ',
    passenger: 'Ուղևոր',

    // Trip Search Page
    findPerfectTrip: 'Գտիր քո կատարյալ ճանապարհորդությունը',
    viewAvailableTaxiTrips: 'Դիտիր հասանելի քաղաքարի տաքսի ճանապարհորդությունները և ամրագրիր քո տեղը',
    from: 'Որտեղից',
    to: 'Ուր',
    date: 'Ամսաթիվ',
    fromCity: 'Ելակետային քաղաք',
    toCity: 'Նպատակային քաղաք',
    clearFilters: 'Մաքրել ֆիլտրերը',
    tripsFound: 'Գտնվել է {count} ճանապարհորդություն',
    tripsFoundPlural: 'Գտնվել են {count} ճանապարհորդություններ',
    noTripsFound: 'Ճանապարհորդություններ չեն գտնվել',
    noTripsPublished: 'Դեռ ճանապարհորդություններ չեն հրապարակվել: Ստուգիր ավելի ուշ կամ ստեղծիր քո սեփական ճանապարհորդությունը:',
    noTripsMatchCriteria: 'Ոչ մի ճանապարհորդություն չի համապատասխանում ձեր փնտրման չափանիշներին: Փորձիր ճշգրտել ֆիլտրերը:',
    createYourFirstTrip: 'Ստեղծել ձեր առաջին ճանապարհորդությունը',
    availableSeats: 'Հասանելի տեղեր',
    pricePerSeat: 'Գինը մեկ տեղի համար',
    carPhotos: 'Մեքենայի լուսանկարներ:',
    stopsOnRoute: 'Կանգառներ ճանապարհին:',
    map: 'Քարտեզ',
    contactDriver: 'Կապվել վարորդի հետ',
    fullyBooked: 'Լրիվ ամրագրված',
    signInToBook: 'Մտնել ամրագրելու համար',
    more: 'more',
    loading: 'Բեռնում է...',
    loadingTrips: 'Բեռնում է ճանապարհորդությունները...',

    // Create Trip Page
    createNewTrip: 'Ստեղծել նոր ճանապարհորդություն',
    publishYourRoute: 'Հրապարակիր ձեր նախատեսված ճանապարհը և կապվիր ճանապարհ փնտրող ուղևորների հետ:',
    routeInfo: 'Երթուղու տեղեկություններ',
    departureCity: 'Ելակետային քաղաք',
    destinationCity: 'Նպատակային քաղաք',
    intermediateStops: 'Ենթակա կանգառներ (ոչ պարտադիր)',
    addStop: 'Ավելացնել կանգառ',
    schedule: 'Ժամանակացույց',
    departureDate: 'Ելքի ամսաթիվ',
    departureTime: 'Ելքի ժամ',
    capacityAndPricing: 'Տեղերի քանակ և գնակալում',
    availableSeatsCount: 'Հասանելի տեղեր',
    pricePerSeatAmount: 'Գինը մեկ տեղի համար',
    currency: 'Արժույթ',
    additionalDetails: 'Լրացուցիչ մանրամասներ',
    tripDescription: 'Ճանապարհորդության նկարագրություն (ոչ պարտադիր)',
    tripDescriptionPlaceholder: 'Ավելացնել լրացուցիչ տեղեկություններ ճանապարհորդության, մեքենայի հարմարությունների, վերցնելու/թողնելու նախապատվությունների մասին:',
    cancel: 'Չեղարկել',
    createTripButton: 'Ստեղծել ճանապարհորդությունը',
    creatingTrip: 'Ստեղծում է ճանապարհորդությունը...',
    somethingWentWrong: 'Ինչ-որ բան սխալ է գնացել',
    connectionError: 'Կապի խնդիր: Խնդրում ենք նորից փորձել:',
    seats: 'տեղ',

    // Trip Map
    routeMap: 'Ճանապարհի քարտեզ',
    start: 'ՄԵԿՆԱՐԿ',
    destination: 'ՆՊԱՏԱԿԱԿԵՏ',
    distance: 'Distance',
    loadingMap: 'Loading map...',
    clickOutsideOrEscToClose: 'Սեղմիր դրսում կամ ESC՝ փակելու համար',

    // Placeholders
    placeholderYerevan: 'օր․ Երևան',
    placeholderVanadzor: 'օր․ Վանաձոր',
    placeholderGyumri: 'օր․ Գյումրի',
    placeholderPrice: '50.00',

    // Common
    km: 'km',
    company: 'Company'
  },
  en: {
    // Navigation
    home: 'Home',
    trips: 'Trips',
    myTrips: 'My Trips',
    messages: 'Messages',
    profile: 'Profile', 
    createTrip: 'Create Trip',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',

    // User related
    hello: 'Hello, {name}',
    driver: 'Driver',
    passenger: 'Passenger',

    // Trip Search Page
    findPerfectTrip: 'Find Your Perfect Trip',
    viewAvailableTaxiTrips: 'Browse available intercity taxi trips and book your seat',
    from: 'From',
    to: 'To',
    date: 'Date',
    fromCity: 'From City',
    toCity: 'To City',
    clearFilters: 'Clear Filters',
    tripsFound: '{count} trip found',
    tripsFoundPlural: '{count} trips found',
    noTripsFound: 'No Trips Found',
    noTripsPublished: 'No trips have been published yet. Check back later or create your own trip:',
    noTripsMatchCriteria: 'No trips match your search criteria. Try adjusting your filters:',
    createYourFirstTrip: 'Create Your First Trip',
    availableSeats: 'Available Seats',
    pricePerSeat: 'Price Per Seat',
    carPhotos: 'Car Photos:',
    stopsOnRoute: 'Stops on route:',
    map: 'Map',
    contactDriver: 'Contact Driver',
    fullyBooked: 'Fully Booked',
    signInToBook: 'Sign In to Book',
    more: 'more',
    loading: 'Loading...',
    loadingTrips: 'Loading trips...',

    // Create Trip Page
    createNewTrip: 'Create New Trip',
    publishYourRoute: 'Publish your planned route and connect with passengers looking for a ride:',
    routeInfo: 'Route Information',
    departureCity: 'Departure City',
    destinationCity: 'Destination City',
    intermediateStops: 'Intermediate Stops (Optional)',
    addStop: 'Add Stop',
    schedule: 'Schedule',
    departureDate: 'Departure Date',
    departureTime: 'Departure Time',
    capacityAndPricing: 'Capacity and Pricing',
    availableSeatsCount: 'Available Seats',
    pricePerSeatAmount: 'Price Per Seat',
    currency: 'Currency',
    additionalDetails: 'Additional Details',
    tripDescription: 'Trip Description (Optional)',
    tripDescriptionPlaceholder: 'Add additional information about the trip, car amenities, pickup/drop-off preferences:',
    cancel: 'Cancel',
    createTripButton: 'Create Trip',
    creatingTrip: 'Creating trip...',
    somethingWentWrong: 'Something went wrong',
    connectionError: 'Connection error: Please try again:',
    seats: 'seat',

    // Trip Map
    routeMap: 'Route Map',
    start: 'START',
    destination: 'DESTINATION',
    distance: 'Distance',
    loadingMap: 'Loading map...',
    clickOutsideOrEscToClose: 'Click outside or ESC to close',

    // Placeholders
    placeholderYerevan: 'e.g. Yerevan',
    placeholderVanadzor: 'e.g. Vanadzor',
    placeholderGyumri: 'e.g. Gyumri',
    placeholderPrice: '50.00',

    // Common
    km: 'km',
    company: 'Company'
  }
}

// I18n Provider Component
export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('hy') // Default to Armenian
  
  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && translations[savedLocale]) {
      setLocale(savedLocale)
    }
  }, [])

  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale)
      localStorage.setItem('locale', newLocale)
    }
  }

  const t = (key, params = {}) => {
    let translation = translations[locale][key] || translations['hy'][key] || key
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param])
    })
    
    return translation
  }

  const value = {
    locale,
    changeLocale,
    t,
    availableLocales: [
      { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Helper function for translations outside of components
export function createTranslator(locale = 'hy') {
  return (key, params = {}) => {
    let translation = translations[locale][key] || translations['hy'][key] || key
    
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param])
    })
    
    return translation
  }
}
