'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Pill, 
  Plus, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  ArrowLeft,
  Heart,
  Loader2,
  AlertCircle,
  Bell,
  History
} from 'lucide-react'
import { getCurrentUser } from '../../../lib/auth'
import Loader from '@/components/ui/Loader'
import { useProtectedUser } from '@/hooks/useProtectedUser'

export default function MedicineRemindersPage() {
  const [reminders, setReminders] = useState([])
  const [todaysSchedule, setTodaysSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [activeTab, setActiveTab] = useState('today') // today, reminders, history
  const router = useRouter()
   const { user, loading:autLoading } = useProtectedUser()

  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'once_daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  })

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily', times: 1 },
    { value: 'twice_daily', label: 'Twice Daily', times: 2 },
    { value: 'three_times_daily', label: 'Three Times Daily', times: 3 },
    { value: 'four_times_daily', label: 'Four Times Daily', times: 4 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'as_needed', label: 'As Needed', times: 1 }
  ]

  console.log(user,'user')

useEffect(() => {

    if(user){
 loadData(user.id)
    }
  
  }, [user])

  const loadData = async (userId) => {
    setLoading(true)
    try {
      await Promise.all([
        loadReminders(userId),
        loadTodaysSchedule(userId)
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReminders = async (userId) => {
    try {
      const response = await fetch(`/api/medicine-reminders?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setReminders(data.data)
      }
    } catch (error) {
      console.error('Error loading reminders:', error)
    }
  }

  const loadTodaysSchedule = async (userId) => {
    try {
      const response = await fetch('/api/medicine-logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await response.json()
      if (data.success) {
        setTodaysSchedule(data.data)
      }
    } catch (error) {
      console.error('Error loading today\'s schedule:', error)
    }
  }

  const handleFrequencyChange = (frequency) => {
    const option = frequencyOptions.find(opt => opt.value === frequency)
    const defaultTimes = []
    
    switch (frequency) {
      case 'once_daily':
        defaultTimes.push('08:00')
        break
      case 'twice_daily':
        defaultTimes.push('08:00', '20:00')
        break
      case 'three_times_daily':
        defaultTimes.push('08:00', '14:00', '20:00')
        break
      case 'four_times_daily':
        defaultTimes.push('08:00', '12:00', '16:00', '20:00')
        break
      case 'weekly':
        defaultTimes.push('08:00')
        break
      case 'as_needed':
        defaultTimes.push('08:00')
        break
    }

    setFormData({
      ...formData,
      frequency,
      times: defaultTimes
    })
  }

  const handleTimeChange = (index, time) => {
    const newTimes = [...formData.times]
    newTimes[index] = time
    setFormData({ ...formData, times: newTimes })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      const url = editingReminder ? '/api/medicine-reminders' : '/api/medicine-reminders'
      const method = editingReminder ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        userId: user.id
      }

      if (editingReminder) {
        payload.reminderId = editingReminder.id
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (data.success) {
        await loadData(user.id)
        resetForm()
      } else {
        alert(data.error || 'Failed to save reminder')
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Failed to save reminder')
    }
  }

  const resetForm = () => {
    setFormData({
      medicineName: '',
      dosage: '',
      frequency: 'once_daily',
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    })
    setShowAddForm(false)
    setEditingReminder(null)
  }

  const handleEdit = (reminder) => {
    setEditingReminder(reminder)
    setFormData({
      medicineName: reminder.medicine_name,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      times: reminder.times,
      startDate: reminder.start_date,
      endDate: reminder.end_date || '',
      notes: reminder.notes || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const response = await fetch(`/api/medicine-reminders?reminderId=${reminderId}&userId=${user.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        await loadData(user.id)
      } else {
        alert(data.error || 'Failed to delete reminder')
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('Failed to delete reminder')
    }
  }

  const updateMedicineStatus = async (scheduleItem, status) => {
    try {
      const response = await fetch('/api/medicine-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reminderId: scheduleItem.reminder.id,
          scheduledTime: scheduleItem.scheduledTime,
          status: status,
          takenTime: status === 'taken' ? new Date().toISOString() : null
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadTodaysSchedule(user.id)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'text-green-600 bg-green-50 border-green-200'
      case 'missed': return 'text-red-600 bg-red-50 border-red-200'
      case 'skipped': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading your reminders...</p>
        </div>
      </div>
    )
  }

  if(autLoading){
    return <Loader/>
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
              <Pill className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Medicine Reminders</h1>
                <p className="text-sm text-gray-600">Never miss your medication</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'today'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reminders'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Reminders
          </button>
        </div>

        {activeTab === 'today' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Medicine Schedule
              </h2>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            {todaysSchedule.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-200">
                {todaysSchedule.map((item, index) => {
                  const time = new Date(item.scheduledTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const isPast = new Date(item.scheduledTime) < new Date()

                  return (
                    <div key={index} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.status === 'taken' ? 'bg-green-100' :
                              item.status === 'missed' ? 'bg-red-100' :
                              item.status === 'skipped' ? 'bg-yellow-100' :
                              isPast ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              <Pill className={`h-6 w-6 ${
                                item.status === 'taken' ? 'text-green-600' :
                                item.status === 'missed' ? 'text-red-600' :
                                item.status === 'skipped' ? 'text-yellow-600' :
                                isPast ? 'text-red-600' : 'text-blue-600'
                              }`} />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.reminder.medicine_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.reminder.dosage}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {time}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {item.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateMedicineStatus(item, 'taken')}
                              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Taken</span>
                            </button>
                            <button
                              onClick={() => updateMedicineStatus(item, 'skipped')}
                              className="bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 flex items-center space-x-1"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Skip</span>
                            </button>
                          </div>
                        )}

                        {item.status === 'taken' && item.takenTime && (
                          <div className="text-sm text-gray-500">
                            Taken at {new Date(item.takenTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines scheduled for today</h3>
                <p className="text-gray-600 mb-4">
                  Add your first medicine reminder to get started
                </p>
                <button
                  onClick={() => {
                    setActiveTab('reminders')
                    setShowAddForm(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Add Medicine Reminder
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Medicine Reminders ({reminders.length})
              </h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Reminder</span>
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingReminder ? 'Edit' : 'Add'} Medicine Reminder
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={formData.medicineName}
                        onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                        required
                        placeholder="e.g., Aspirin, Metformin"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        required
                        placeholder="e.g., 100mg, 1 tablet"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {frequencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Times *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.times.map((time, index) => (
                        <input
                          key={index}
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional instructions or notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {editingReminder ? 'Update' : 'Add'} Reminder
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reminders List */}
            {reminders.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            reminder.is_active ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Pill className={`h-6 w-6 ${
                              reminder.is_active ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reminder.medicine_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              reminder.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reminder.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Dosage:</strong> {reminder.dosage}</p>
                            <p><strong>Frequency:</strong> {
                              frequencyOptions.find(opt => opt.value === reminder.frequency)?.label || reminder.frequency
                            }</p>
                            <p><strong>Times:</strong> {reminder.times.join(', ')}</p>
                            <p><strong>Duration:</strong> {reminder.start_date} {reminder.end_date ? `to ${reminder.end_date}` : '(ongoing)'}</p>
                            {reminder.notes && (
                              <p><strong>Notes:</strong> {reminder.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(reminder)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit reminder"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete reminder"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicine reminders yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first reminder to start tracking your medications
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Add Your First Reminder
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips Card */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Medicine Reminder Tips</span>
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Set reminders for the same times each day to build a routine</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Take medicines with food if recommended by your doctor</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Don't skip doses - mark as 'skipped' only when necessary</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Consult your doctor before stopping any medication</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )

}