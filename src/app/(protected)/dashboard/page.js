'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Stethoscope, Pill, MapPin, Users, Settings, LogOut, Activity, Shield, Sparkles, ChevronRight, Calendar, CheckCircle, Clock
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useProtectedProfile } from '@/hooks/useProtectedProfile';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Alert from '@/components/ui/Alert';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: profileLoading } = useProtectedProfile();
  
  const [data, setData] = useState({
    appointments: [],
    medsToday: [],
    symptomChecks: [],
    loading: true
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [aptRes, medRes, symRes] = await Promise.all([
        fetch(`/api/appointments?userId=${user.id}`).then(res => res.json()),
        fetch('/api/medicine-logs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).then(res => res.json()),
        fetch(`/api/symptom-history?userId=${user.id}&limit=3`).then(res => res.json())
      ]);

      setData({
        appointments: aptRes.success ? aptRes.data : [],
        medsToday: medRes.success ? medRes.data : [],
        symptomChecks: symRes.success ? symRes.data : [],
        loading: false
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['full_name', 'date_of_birth', 'gender', 'height_cm', 'weight_kg', 'blood_type'];
    const filled = fields.filter(f => !!profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (profileLoading || data.loading) return <Loader />;

  const quickActions = [
    { title: 'Symptom Checker', desc: 'AI-powered health insights', icon: Stethoscope, href: '/symptom-checker', color: 'blue' },
    { title: 'Find Facility', desc: 'Hospitals & clinics near you', icon: MapPin, href: '/find-facility', color: 'emerald' },
    { title: 'Medications', desc: 'Track your daily pills', icon: Pill, href: '/reminders', color: 'purple' },
    { title: 'Patient Summary', desc: 'Report for your doctor', icon: Activity, href: '/patient-summary', color: 'orange' },
  ];

  const pendingMeds = data.medsToday.filter(m => m.status === 'pending');
  const upcomingAppointments = data.appointments.filter(a => new Date(a.appointment_date) > new Date()).slice(0, 3);
  const completion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">HealthCare+</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => router.push('/profile')} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"><Settings className="h-5 w-5" /></button>
            <button onClick={handleSignOut} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {profile?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-slate-500 mt-1">Here is your daily health overview.</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-100 font-medium">Profile Completion</p>
                <h3 className="text-3xl font-bold mt-1">{completion}%</h3>
              </div>
              <Sparkles className="h-6 w-6 text-primary-200" />
            </div>
            {completion < 100 && (
              <button onClick={() => router.push('/profile')} className="mt-4 text-sm text-white font-medium hover:underline flex items-center">
                Complete profile <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </Card>
          
          <Card className="bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium text-sm">Pending Meds Today</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{pendingMeds.length}</h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg"><Pill className="h-5 w-5 text-amber-600" /></div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium text-sm">Upcoming Appointments</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{upcomingAppointments.length}</h3>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg"><Calendar className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </Card>

          <Card className="bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium text-sm">Recent Symptom Checks</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{data.symptomChecks.length}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg"><Stethoscope className="h-5 w-5 text-blue-600" /></div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div key={idx} onClick={() => router.push(action.href)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                  <div className={`bg-${action.color}-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{action.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
              <button onClick={() => router.push('/find-facility')} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                Book new <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt, idx) => (
                  <Card key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center min-w-16">
                        <div className="text-xs font-bold text-emerald-600 uppercase">{new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</div>
                        <div className="text-xl font-black text-emerald-900">{new Date(apt.appointment_date).getDate()}</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{apt.reason}</h4>
                        <div className="text-sm text-slate-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'}>{apt.status}</Badge>
                  </Card>
                ))
              ) : (
                <EmptyState title="No upcoming appointments" description="You have no scheduled visits." action={<button onClick={() => router.push('/find-facility')} className="text-primary-600 font-medium">Find a facility</button>} />
              )}
            </div>
          </div>

          {/* Today's Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Medications Today</h2>
              <button onClick={() => router.push('/reminders')} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                Manage all <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {data.medsToday.length > 0 ? (
                data.medsToday.slice(0, 4).map((med, idx) => (
                  <Card key={idx} className={`flex items-center justify-between ${med.status === 'taken' ? 'opacity-70' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-lg ${med.status === 'taken' ? 'bg-emerald-100' : 'bg-primary-100'}`}>
                        <Pill className={`h-5 w-5 ${med.status === 'taken' ? 'text-emerald-600' : 'text-primary-600'}`} />
                      </div>
                      <div>
                        <h4 className={`font-bold ${med.status === 'taken' ? 'text-slate-600 line-through' : 'text-slate-900'}`}>{med.reminder.medicine_name}</h4>
                        <div className="text-sm text-slate-500">{med.reminder.dosage}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-slate-900">{new Date(med.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <Badge variant={med.status === 'taken' ? 'success' : med.status === 'missed' ? 'danger' : 'default'} className="mt-1">{med.status}</Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState title="No medications today" description="You have no pills scheduled for today." />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}