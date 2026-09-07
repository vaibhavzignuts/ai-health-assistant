import React, { useState, useEffect } from 'react';
import { User, Activity, AlertCircle, Save, ArrowLeft, Plus, X } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export const ProfileEditPage = ({ initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    blood_type: '',
    allergies: '',
    existing_conditions: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        full_name: initialProfile.full_name || '',
        date_of_birth: initialProfile.date_of_birth || '',
        gender: initialProfile.gender || '',
        height_cm: initialProfile.height_cm || '',
        weight_kg: initialProfile.weight_kg || '',
        blood_type: initialProfile.blood_type || '',
        allergies: initialProfile.allergies || '',
        existing_conditions: initialProfile.existing_conditions || '',
      });
    }
  }, [initialProfile]);

  const validateForm = () => {
    const newErrors = {};
    if (!profile.full_name) newErrors.full_name = 'Full name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCompletion = () => {
    const fields = Object.keys(profile);
    const filledFields = fields.filter(field => !!profile[field]).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onCancel} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Health Profile</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Completion: {completion}%</span>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors ${errors.full_name ? 'border-red-300' : 'border-slate-300'}`}
                placeholder="Alex Morgan"
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={profile.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Physical Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
              <input
                type="number"
                value={profile.height_cm}
                onChange={(e) => handleInputChange('height_cm', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="175"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight_kg}
                onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Type</label>
              <select
                value={profile.blood_type}
                onChange={(e) => handleInputChange('blood_type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors bg-white"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-rose-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Clinical Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Allergies</label>
              <textarea
                value={profile.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none"
                placeholder="List any known allergies (e.g., Peanuts, Penicillin)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Existing Conditions</label>
              <textarea
                value={profile.existing_conditions}
                onChange={(e) => handleInputChange('existing_conditions', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-colors resize-none"
                placeholder="List any chronic or existing conditions (e.g., Hypertension, Asthma)"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors flex items-center shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
