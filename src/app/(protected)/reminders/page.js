'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Plus, Clock, CheckCircle, XCircle, Edit3, Trash2, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { useProtectedUser } from '@/hooks/useProtectedUser';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function MedicineRemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const router = useRouter();
  const { user, loading: authLoading } = useProtectedUser();

  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'once_daily',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times_daily', label: 'Three Times Daily' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  useEffect(() => {
    if (user) loadData(user.id);
  }, [user]);

  const loadData = async (userId) => {
    setLoading(true);
    try {
      const [remRes, schedRes, logsRes] = await Promise.all([
        fetch(`/api/medicine-reminders?userId=${userId}`).then(res => res.json()),
        fetch('/api/medicine-logs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }).then(res => res.json()),
        fetch(`/api/medicine-logs?userId=${userId}&limit=500`).then(res => res.json())
      ]);

      if (remRes.success) setReminders(remRes.data);
      if (schedRes.success) setTodaysSchedule(schedRes.data);
      if (logsRes.success) setLogs(logsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdherence = () => {
    if (!logs.length) return 0;
    const taken = logs.filter(l => l.status === 'taken').length;
    // For adherence, only count past or completed logs
    const total = logs.filter(l => ['taken', 'missed', 'skipped'].includes(l.status)).length;
    return total === 0 ? 100 : Math.round((taken / total) * 100);
  };

  const handleFrequencyChange = (frequency) => {
    let times = ['08:00'];
    if (frequency === 'twice_daily') times = ['08:00', '20:00'];
    if (frequency === 'three_times_daily') times = ['08:00', '14:00', '20:00'];
    
    setFormData(prev => ({ ...prev, frequency, times }));
  };

  const handleTimeChange = (index, time) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const url = '/api/medicine-reminders';
      const method = editingReminder ? 'PUT' : 'POST';
      const payload = { ...formData, userId: user.id };
      
      if (editingReminder) payload.reminderId = editingReminder.id;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        await loadData(user.id);
        resetForm();
      } else {
        alert(data.error || 'Failed to save reminder');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      medicineName: '', dosage: '', frequency: 'once_daily',
      times: ['08:00'], startDate: new Date().toISOString().split('T')[0],
      endDate: '', notes: ''
    });
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medicineName: reminder.medicine_name, dosage: reminder.dosage,
      frequency: reminder.frequency, times: reminder.times,
      startDate: reminder.start_date, endDate: reminder.end_date || '', notes: reminder.notes || ''
    });
    setShowAddForm(true);
    setActiveTab('reminders');
  };

  const handleDelete = async (reminderId) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await fetch(`/api/medicine-reminders?reminderId=${reminderId}&userId=${user.id}`, { method: 'DELETE' });
      await loadData(user.id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const updateMedicineStatus = async (scheduleItem, status) => {
    try {
      const res = await fetch('/api/medicine-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          reminderId: scheduleItem.reminder.id,
          scheduledTime: scheduleItem.scheduledTime,
          status: status,
          takenTime: status === 'taken' ? new Date().toISOString() : null
        })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic UI update or reload
        await loadData(user.id);
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  if (authLoading || loading) return <Loader />;

  const adherence = calculateAdherence();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg shadow-sm border border-slate-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Medication Management</h1>
              <p className="text-sm text-slate-500">Track and manage your daily prescriptions</p>
            </div>
          </div>
          <button 
            onClick={() => { setActiveTab('reminders'); setShowAddForm(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medication</span>
          </button>
        </div>

        {/* Adherence Card */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 font-medium">Overall Adherence</p>
              <h2 className="text-4xl font-bold mt-1">{adherence}%</h2>
              <p className="text-sm text-primary-200 mt-2">Based on your recent medication history.</p>
            </div>
            <div className="hidden md:flex items-center justify-center h-24 w-24 rounded-full border-4 border-white/20">
              <Pill className="h-10 w-10 text-white/80" />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'today' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reminders' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            All Medications
          </button>
        </div>

        {/* Today's Schedule */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {todaysSchedule.length > 0 ? (
              todaysSchedule.map((item, idx) => {
                const timeStr = new Date(item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isPast = new Date(item.scheduledTime) < new Date() && item.status === 'pending';
                
                return (
                  <Card key={idx} className={`transition-all ${item.status === 'taken' ? 'opacity-70 bg-slate-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${item.status === 'taken' ? 'bg-emerald-100' : isPast ? 'bg-rose-100' : 'bg-primary-100'}`}>
                          <Pill className={`h-6 w-6 ${item.status === 'taken' ? 'text-emerald-600' : isPast ? 'text-rose-600' : 'text-primary-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">{item.reminder.medicine_name}</h3>
                          <div className="flex items-center space-x-3 text-sm mt-1">
                            <span className="text-slate-600 font-medium">{item.reminder.dosage}</span>
                            <span className="text-slate-400">•</span>
                            <span className="flex items-center text-slate-500">
                              <Clock className="h-4 w-4 mr-1" /> {timeStr}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {item.status === 'pending' ? (
                          <>
                            <button onClick={() => updateMedicineStatus(item, 'taken')} className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Taken
                            </button>
                            <button onClick={() => updateMedicineStatus(item, 'skipped')} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                              Skip
                            </button>
                          </>
                        ) : (
                          <Badge variant={item.status === 'taken' ? 'success' : item.status === 'missed' ? 'danger' : 'warning'}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <EmptyState 
                title="No medications today" 
                description="You don't have any medications scheduled for today." 
                action={<button onClick={() => { setActiveTab('reminders'); setShowAddForm(true); }} className="text-primary-600 font-medium">Add a medication</button>}
              />
            )}
          </div>
        )}

        {/* All Reminders & Add Form */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {showAddForm && (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{editingReminder ? 'Edit Medication' : 'Add Medication'}</h3>
                  <button onClick={resetForm} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name *</label>
                      <input type="text" required value={formData.medicineName} onChange={e => handleInputChange('medicineName', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
                      <input type="text" required value={formData.dosage} onChange={e => handleInputChange('dosage', e.target.value)} placeholder="e.g., 500mg" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency *</label>
                    <select value={formData.frequency} onChange={e => handleFrequencyChange(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                      {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Times *</label>
                    <div className="flex flex-wrap gap-3">
                      {formData.times.map((t, idx) => (
                        <input key={idx} type="time" required value={t} onChange={e => handleTimeChange(idx, e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={resetForm} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">Save Medication</button>
                  </div>
                </form>
              </Card>
            )}

            {!showAddForm && reminders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reminders.map(rem => (
                  <Card key={rem.id} className="hover-lift flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-50 p-2 rounded-lg">
                          <Pill className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{rem.medicine_name}</h4>
                          <p className="text-sm text-slate-500">{rem.dosage}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => handleEdit(rem)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(rem.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 space-y-1 mt-auto">
                      <div className="flex items-center"><Clock className="h-3 w-3 mr-2" /> {rem.times.join(', ')}</div>
                      <div className="flex items-center"><Calendar className="h-3 w-3 mr-2" /> {frequencyOptions.find(o => o.value === rem.frequency)?.label}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!showAddForm && reminders.length === 0 && (
              <EmptyState 
                title="No medications added" 
                description="You haven't set up any medication reminders yet." 
                action={<button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm transition-colors font-medium">Add Medication</button>}
              />
            )}
          </div>
        )}
        
      </div>
    </div>
  );
  
  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }
}