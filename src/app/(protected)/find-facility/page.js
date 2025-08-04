'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Navigation,
  ArrowLeft,
  Heart,
  Search,
  Loader2,
  Hospital,
  Building,
  Cross,
  Activity,
  AlertCircle,
  ExternalLink,
  Filter,
  Info
} from 'lucide-react'

import { useProtectedUser } from '@/hooks/useProtectedUser'
import Loader from '@/components/ui/Loader'

export default function FacilityFinderPage() {

  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [facilityType, setFacilityType] = useState('all')
  const [radius, setRadius] = useState(10)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const router = useRouter()
  const { user, loading: autLoading } = useProtectedUser()

  // Available cities with hospital data
  const availableCities = [
    { value: '', label: 'Select a city' },
    { value: 'Mumbai', label: 'Mumbai, Maharashtra' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Bangalore', label: 'Bangalore, Karnataka' },
    { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
    { value: 'Kolkata', label: 'Kolkata, West Bengal' },
    { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
    { value: 'Pune', label: 'Pune, Maharashtra' },
    { value: 'Ahmedabad', label: 'Ahmedabad, Gujarat' },
    { value: 'Surat', label: 'Surat, Gujarat' },
    { value: 'Jaipur', label: 'Jaipur, Rajasthan' }
  ]

  const facilityTypes = [
    { value: 'all', label: 'All Facilities', icon: Building },
    { value: 'hospital', label: 'Hospitals', icon: Hospital },
    { value: 'clinic', label: 'Clinics', icon: Cross },
    { value: 'pharmacy', label: 'Pharmacies', icon: Activity },
    { value: 'diagnostic_center', label: 'Diagnostics', icon: Activity },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle }
  ]

  if(autLoading){
    return<Loader/>
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setLocationLoading(false)
          
          // Try to match user location to nearest available city
          // For now, we'll just show a message that user should select from available cities
          alert('Please select your city from the dropdown list of available cities.')
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location. Please select your city from the dropdown.')
          setLocationLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
      setLocationLoading(false)
    }
  }

  const searchFacilities = async (city = selectedCity, type = facilityType, searchRadius = radius) => {
    if (!user || !city.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: user.id,
        city: city.trim(),
        type: type,
        radius: searchRadius.toString()
      })

      const response = await fetch(`/api/find-facility?${params}`)
      const data = await response.json()

      if (data.success) {
        setFacilities(data.data)
      } else {
        alert(data.error || 'Failed to find facilities')
      }
    } catch (error) {
      console.error('Error searching facilities:', error)
      alert('Failed to search facilities. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!selectedCity) {
      alert('Please select a city first.')
      return
    }
    searchFacilities()
  }

  const getFacilityIcon = (type) => {
    const typeData = facilityTypes.find(t => t.value === type)
    return typeData ? typeData.icon : Building
  }

  const getFacilityTypeColor = (type) => {
    switch (type) {
      case 'hospital': return 'bg-red-100 text-red-800'
      case 'clinic': return 'bg-blue-100 text-blue-800'
      case 'pharmacy': return 'bg-green-100 text-green-800'
      case 'diagnostic_center': return 'bg-purple-100 text-purple-800'
      case 'emergency': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openDirections = (facility) => {
    if (facility.latitude && facility.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`
      window.open(url, '_blank')
    } else {
      const address = encodeURIComponent(facility.address + ', ' + facility.city)
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`
      window.open(url, '_blank')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Find Healthcare Facilities</h1>
                <p className="text-sm text-gray-600">Locate nearby hospitals, clinics, and pharmacies</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Beta Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Currently Available Cities</h3>
              <p className="text-sm text-blue-800 mt-1">
                We currently have healthcare facility data for major Indian cities. More cities and facilities will be added in the next version. 
                Please select from the available cities below.
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search for Healthcare Facilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select City *
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableCities.map(city => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
                  title="Use current location (limited to available cities)"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Auto-detect</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select from available cities with healthcare data
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility Type
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {facilityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Area
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>City Center (5 km)</option>
                <option value={10}>Nearby Areas (10 km)</option>
                <option value={15}>Extended Area (15 km)</option>
                <option value={25}>Greater Area (25 km)</option>
                <option value={50}>Metropolitan (50 km)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !selectedCity}
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search Facilities</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {facilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Found {facilities.length} facilities in {selectedCity}
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {facilities.map((facility) => {
                const IconComponent = getFacilityIcon(facility.type)
                return (
                  <div key={facility.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {facility.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFacilityTypeColor(facility.type)}`}>
                              {facility.type.replace('_', ' ').toUpperCase()}
                            </span>
                            {facility.emergency_services && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                EMERGENCY
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{facility.address}, {facility.city}</span>
                              {facility.distance && (
                                <span className="text-blue-600 font-medium">
                                  ({facility.distance} km away)
                                </span>
                              )}
                            </div>

                            {facility.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <a
                                  href={`tel:${facility.phone}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {facility.phone}
                                </a>
                              </div>
                            )}

                            {facility.services && facility.services.length > 0 && (
                              <div className="flex items-start space-x-2">
                                <Activity className="h-4 w-4 mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                  {facility.services.slice(0, 3).map((service, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                      {service}
                                    </span>
                                  ))}
                                  {facility.services.length > 3 && (
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                      +{facility.services.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {facility.rating > 0 && (
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{facility.rating}/5</span>
                                {facility.total_reviews > 0 && (
                                  <span className="text-gray-500">
                                    ({facility.total_reviews} reviews)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => openDirections(facility)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
                        >
                          <Navigation className="h-4 w-4" />
                          <span>Directions</span>
                        </button>

                        {facility.phone && (
                          <a
                            href={`tel:${facility.phone}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 text-center justify-center"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </a>
                        )}

                        {facility.website && (
                          <a
                            href={facility.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 text-center justify-center"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && facilities.length === 0 && selectedCity && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600 mb-4">
              We could not find any healthcare facilities matching your criteria in {selectedCity}.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setFacilityType('all')
                  setRadius(50)
                  setTimeout(() => handleSearch(), 100)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 mr-2"
              >
                Search All Types (50km)
              </button>
              <p className="text-sm text-gray-500">
                Try selecting a different city or facility type, or check back soon as we're adding more facilities regularly.
              </p>
            </div>
          </div>
        )}

        {/* Emergency Numbers Card */}
        <div className="mt-6 bg-red-50 rounded-lg border border-red-200 p-6">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Emergency Contact Numbers</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">102</div>
              <div className="text-sm text-red-800">Ambulance</div>
              <a
                href="tel:102"
                className="inline-block mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Call Now
              </a>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">101</div>
              <div className="text-sm text-red-800">Fire Department</div>
              <a
                href="tel:101"
                className="inline-block mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Call Now
              </a>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">100</div>
              <div className="text-sm text-red-800">Police</div>
              <a
                href="tel:100"
                className="inline-block mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}