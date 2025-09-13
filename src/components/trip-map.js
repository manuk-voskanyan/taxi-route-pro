'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false })

// Armenian city coordinates (you can expand this)
const CITY_COORDINATES = {
  'Երևան': [40.1792, 44.4991],
  'Yerevan': [40.1792, 44.4991],
  'Գյումրի': [40.7942, 43.8503],
  'Gyumri': [40.7942, 43.8503],
  'Վանաձոր': [40.8058, 44.4939],
  'Vanadzor': [40.8058, 44.4939],
  'Գորիս': [39.5081, 46.3408],
  'Goris': [39.5081, 46.3408],
  'Կապան': [39.2078, 46.4064],
  'Kapan': [39.2078, 46.4064],
  'Իջևան': [40.8772, 45.1533],
  'Ijevan': [40.8772, 45.1533],
  'Սեվան': [40.5561, 45.0064],
  'Sevan': [40.5561, 45.0064],
  'Բարև': [40.2731, 43.8669], // Approximate coordinates
  'Barev': [40.2731, 43.8669]
}

export default function TripMap({ fromCity, toCity, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load Leaflet and create custom icons
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Fix default marker icons
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/marker-icon-2x.png',
          iconUrl: '/marker-icon.png',
          shadowUrl: '/marker-shadow.png',
        })
        setLeafletLoaded(true)
      })
    }
  }, [])

  if (!isOpen || !mounted) return null

  // Get coordinates for cities
  const fromCoords = CITY_COORDINATES[fromCity] || CITY_COORDINATES[fromCity?.toLowerCase()] || [40.1792, 44.4991]
  const toCoords = CITY_COORDINATES[toCity] || CITY_COORDINATES[toCity?.toLowerCase()] || [40.1792, 44.4991]

  // Calculate center point for map
  const centerLat = (fromCoords[0] + toCoords[0]) / 2
  const centerLng = (fromCoords[1] + toCoords[1]) / 2

  // Route line coordinates (red path)
  const routeCoordinates = [fromCoords, toCoords]

  // Create custom icons when Leaflet is loaded
  const createCustomIcons = () => {
    if (typeof window === 'undefined' || !leafletLoaded) return { startIcon: null, endIcon: null }
    
    const L = require('leaflet')
    
    const startIcon = L.divIcon({
        html: `
          <div class="custom-marker start-marker">
            <div class="marker-pin">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                   viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 
                         9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 
                         2.5-2.5 2.5 1.12 2.5 2.5-1.12 
                         2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="marker-label">START</div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
      })
      
      const endIcon = L.divIcon({
        html: `
          <div class="custom-marker end-marker">
            <div class="marker-pin">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                   viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 
                         9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 
                         2.5-2.5 2.5 1.12 2.5 2.5-1.12 
                         2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="marker-label">END</div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
      })
      

    return { startIcon, endIcon }
  }

  const { startIcon, endIcon } = createCustomIcons()

  // Calculate distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <div>
              <h3 className="font-bold text-lg">Ճանապարհի քարտեզ</h3>
              <p className="text-blue-100 text-sm flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full inline-block mr-2"></span>
                {fromCity} → {toCity}
                <span className="bg-red-500 w-2 h-2 rounded-full inline-block ml-2"></span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors bg-opacity-20 rounded-full p-2 hover:bg-opacity-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Coordinate Info Bar */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="font-medium">{fromCity}:</span>
                <span className="ml-1">{fromCoords[0].toFixed(4)}, {fromCoords[1].toFixed(4)}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                <span className="font-medium">{toCity}:</span>
                <span className="ml-1">{toCoords[0].toFixed(4)}, {toCoords[1].toFixed(4)}</span>
              </div>
            </div>
            <div className="text-gray-500">
              Distance: ~{Math.round(calculateDistance(fromCoords, toCoords))} km
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          {mounted && leafletLoaded && (
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={8}
              style={{ height: '500px', width: '100%' }}
              className="rounded-b-lg"
              key={`${fromCity}-${toCity}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Route line with shadow effect */}
              <Polyline 
                positions={routeCoordinates} 
                color="#000"
                weight={6}
                opacity={0.3}
              />
              <Polyline 
                positions={routeCoordinates} 
                color="#dc2626"
                weight={4}
                opacity={0.9}
                dashArray="5, 10"
              />
              
              {/* Route waypoints/dots */}
              {routeCoordinates.map((coord, index) => (
                <CircleMarker
                  key={index}
                  center={coord}
                  radius={6}
                  fillColor={index === 0 ? "#10b981" : "#dc2626"}
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={1}
                />
              ))}
              
              {/* Custom Starting point marker */}
              <Marker position={fromCoords} icon={startIcon}>
                <Popup className="custom-popup">
                  <div className="p-3 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <strong className="text-green-700">ՄԵԿՆԱՐԿ</strong>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{fromCity}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fromCoords[0].toFixed(4)}, {fromCoords[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Custom Destination marker */}
              <Marker position={toCoords} icon={endIcon}>
                <Popup className="custom-popup">
                  <div className="p-3 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <strong className="text-red-700">ՆՊԱՏԱԿԱԿԵՏ</strong>
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{toCity}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {toCoords[0].toFixed(4)}, {toCoords[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
          {(!mounted || !leafletLoaded) && (
            <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-b-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div className="text-gray-500">Loading map...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
