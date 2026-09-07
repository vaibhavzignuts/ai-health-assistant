'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Phone, Clock, Star, Navigation, ArrowLeft,
  Search, Loader2, Hospital, Building, Cross, Activity, AlertCircle, ExternalLink, Info, Calendar as CalendarIcon, XCircle
} from "lucide-react";

import { useProtectedUser } from "@/hooks/useProtectedUser";
import Loader from "@/components/ui/Loader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Alert from "@/components/ui/Alert";

export default function FacilityFinderPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [facilityType, setFacilityType] = useState("all");
  const [bookingFacility, setBookingFacility] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' });
  const [isBooking, setIsBooking] = useState(false);
  
  const router = useRouter();
  const { user, loading: authLoading } = useProtectedUser();

  const availableCities = [
    { value: "", label: "Select a city" },
    { value: "Mumbai", label: "Mumbai, Maharashtra" },
    { value: "Delhi", label: "Delhi" },
    { value: "Bangalore", label: "Bangalore, Karnataka" },
    { value: "Chennai", label: "Chennai, Tamil Nadu" },
    { value: "Kolkata", label: "Kolkata, West Bengal" },
  ];

  const facilityTypes = [
    { value: "all", label: "All Facilities", icon: Building },
    { value: "hospital", label: "Hospitals", icon: Hospital },
    { value: "clinic", label: "Clinics", icon: Cross },
    { value: "pharmacy", label: "Pharmacies", icon: Activity },
    { value: "emergency", label: "Emergency", icon: AlertCircle },
  ];

  const searchFacilities = async () => {
    if (!user || !selectedCity.trim()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id, city: selectedCity.trim(), type: facilityType, radius: "10",
      });
      const response = await fetch(`/api/find-facility?${params}`);
      const data = await response.json();
      if (data.success) {
        setFacilities(data.data);
      }
    } catch (error) {
      console.error("Error searching facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user || !bookingFacility || !bookingData.date || !bookingData.time) return;
    setIsBooking(true);
    try {
      // Create appointment in database
      const datetime = new Date(`${bookingData.date}T${bookingData.time}`).toISOString();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          facilityId: bookingFacility.id, // Using the mocked ID or real ID
          doctorName: 'General Consultation',
          appointmentDate: datetime,
          reason: bookingData.reason || 'General checkup'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Appointment booked successfully!');
        setBookingFacility(null);
        setBookingData({ date: '', time: '', reason: '' });
      } else {
        alert(data.error || 'Failed to book');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error booking appointment');
    } finally {
      setIsBooking(false);
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg shadow-sm border border-slate-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Healthcare Facilities</h1>
              <p className="text-sm text-slate-500">Find and book appointments nearby</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                {availableCities.map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Facility Type</label>
              <select value={facilityType} onChange={(e) => setFacilityType(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                {facilityTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={searchFacilities} disabled={loading || !selectedCity} className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center transition-colors">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
                Search
              </button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {facilities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {facilities.map((facility, idx) => (
              <Card key={facility.id || idx} className="hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-2.5 rounded-xl">
                        <Hospital className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{facility.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default">{facility.type.replace('_', ' ').toUpperCase()}</Badge>
                          {facility.emergency_services && <Badge variant="emergency">EMERGENCY</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {facility.address}, {facility.city}</div>
                    {facility.phone && <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {facility.phone}</div>}
                    {facility.rating > 0 && (
                      <div className="flex items-center"><Star className="h-4 w-4 mr-2 text-amber-400 fill-amber-400" /> {facility.rating}/5</div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => setBookingFacility(facility)} className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                    Book Appointment
                  </button>
                  <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`, "_blank")} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors flex justify-center items-center">
                    <Navigation className="h-4 w-4 mr-1" /> Map
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : !loading && selectedCity ? (
          <EmptyState title="No facilities found" description="Try selecting a different city or facility type." />
        ) : null}
      </div>

      {/* Booking Modal */}
      {bookingFacility && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Book Appointment</h3>
              <button onClick={() => setBookingFacility(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="h-6 w-6" /></button>
            </div>
            
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-900">{bookingFacility.name}</p>
              <p className="text-sm text-slate-600">{bookingFacility.address}</p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                  <input type="time" required value={bookingData.time} onChange={e => setBookingData({...bookingData, time: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for visit</label>
                <textarea rows={3} value={bookingData.reason} onChange={e => setBookingData({...bookingData, reason: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Briefly describe your symptoms or reason for appointment" />
              </div>

              <button type="submit" disabled={isBooking} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex justify-center items-center">
                {isBooking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CalendarIcon className="h-5 w-5 mr-2" />}
                Confirm Booking
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
