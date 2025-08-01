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
  Filter
} from 'lucide-react'
import { getCurrentUser } from '../../../lib/auth'

export default function FacilityFinderPage() {
  const [user, setUser] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const [facilityType, setFacilityType] = useState('all')
  const [radius, setRadius] = useState(10)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const router = useRouter()

  const facilityTypes = [
    { value: 'all', label: 'All Facilities', icon: Building },
    { value: 'hospital', label: 'Hospitals', icon: Hospital },
    { value: 'clinic', label: 'Clinics', icon: Cross },
    { value: 'pharmacy', label: 'Pharmacies', icon: Activity },
    { value: 'diagnostic_center', label: 'Diagnostics', icon: Activity },
    { value: 'emergency', label: 'Emergency', icon: AlertCircle }
  ]

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
      } else {
        setUser(currentUser)
      }
    }
    checkUser()
  }, [router])

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
          setSearchLocation(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
          setLocationLoading(false)
          searchFacilities('', facilityType, radius, location.lat, location.lng)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location. Please enter it manually.')
          setLocationLoading(false)
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
      setLocationLoading(false)
    }
  }

  const searchFacilities = async (location = searchLocation, type = facilityType, searchRadius = radius, lat = null, lng = null) => {
    if (!user || (!location.trim() && !lat && !lng)) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: user.id,
        type: type,
        radius: searchRadius.toString()
      })

      if (lat && lng) {
        params.append('lat', lat.toString())
        params.append('lng', lng.toString())
      } else if (location.trim()) {
        params.append('location', location.trim())
      }

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
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search for Healthcare Facilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter city, area, or address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Use Current</span>
                </button>
              </div>
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
                Radius (km)
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || (!searchLocation.trim() && !userLocation)}
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
                Found {facilities.length} facilities
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
        {!loading && facilities.length === 0 && searchLocation && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600 mb-4">
              We could not find any healthcare facilities matching your criteria in the specified area.
            </p>
            <button
              onClick={() => {
                setRadius(25)
                handleSearch()
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Search in wider area (25km)
            </button>
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