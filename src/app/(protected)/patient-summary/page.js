'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Printer, ChevronLeft, Calendar, Pill, Activity, Stethoscope, MessageCircle, Info } from 'lucide-react';
import { useProtectedUser } from '@/hooks/useProtectedUser';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

export default function PatientSummaryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useProtectedUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSummary();
  }, [user]);

  const loadSummary = async () => {
    try {
      // Gather data from multiple endpoints to build a summary
      const [profileRes, medsRes, symptomsRes, questionsRes] = await Promise.all([
        // Using existing endpoints if available or fetch directly (would use a dedicated summary endpoint in prod)
        fetch('/api/symptom-history?userId=' + user.id + '&limit=5').then(r => r.json()),
        fetch('/api/medicine-reminders?userId=' + user.id).then(r => r.json()),
        fetch('/api/symptom-history?userId=' + user.id).then(r => r.json()), // Mocking profile fetch for now
        fetch('/api/doctor-questions?userId=' + user.id).then(r => r.json())
      ]);

      setData({
        recentSymptoms: symptomsRes.success ? symptomsRes.data.slice(0, 5) : [],
        activeMeds: medsRes.success ? medsRes.data : [],
        questions: questionsRes.success ? questionsRes.data : [],
      });
    } catch (error) {
      console.error('Failed to load patient summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header (No print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg shadow-sm border border-slate-200">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Patient Summary for Doctor</h1>
              <p className="text-sm text-slate-500">Print or share this page at your next visit</p>
            </div>
          </div>
          <button onClick={handlePrint} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-medium transition-colors flex items-center justify-center">
            <Printer className="h-4 w-4 mr-2" /> Print Summary
          </button>
        </div>

        {/* Printable Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 print:shadow-none print:border-none print:p-0 space-y-10">
          
          <div className="text-center pb-8 border-b border-slate-200">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Health Summary Report</h1>
            <p className="text-slate-500 flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" /> Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Current Medications */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
              <Pill className="h-6 w-6 text-primary-600 mr-2" /> Current Medications
            </h2>
            {data.activeMeds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.activeMeds.map(med => (
                  <div key={med.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                    <h3 className="font-bold text-slate-900">{med.medicine_name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                    {med.notes && <p className="text-xs text-slate-500 mt-2 italic">"{med.notes}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No active medications recorded.</p>
            )}
          </section>

          {/* Recent Symptom Checks */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
              <Activity className="h-6 w-6 text-primary-600 mr-2" /> Recent Symptom Checks
            </h2>
            {data.recentSymptoms.length > 0 ? (
              <div className="space-y-4">
                {data.recentSymptoms.map(check => (
                  <div key={check.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300 flex justify-between items-start">
                    <div className="pr-4">
                      <p className="text-sm text-slate-500 mb-1">{new Date(check.created_at).toLocaleDateString()}</p>
                      <p className="font-medium text-slate-900">"{check.symptoms_entered}"</p>
                    </div>
                    <Badge variant={check.urgency_level === 'emergency' ? 'emergency' : check.urgency_level === 'urgent' ? 'warning' : 'default'} className="print:text-black print:bg-white print:border-slate-400">
                      {check.urgency_level}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No recent symptoms reported.</p>
            )}
          </section>

          {/* Questions for Doctor */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
              <MessageCircle className="h-6 w-6 text-primary-600 mr-2" /> Questions for the Doctor
            </h2>
            {data.questions.length > 0 ? (
              <ul className="space-y-3">
                {data.questions.map(q => (
                  <li key={q.id} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-primary-600 mt-2 mr-3 flex-shrink-0 print:bg-black"></div>
                    <p className="text-slate-800">{q.question}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No questions recorded.</p>
            )}
          </section>

          {/* Add a new question (Hidden in print) */}
          <section className="print:hidden border-t border-slate-200 pt-8">
            <Alert variant="info" title="Tip">
              Keep track of questions that come to mind before your appointment so you don't forget to ask them.
            </Alert>
          </section>

        </div>
      </div>
    </div>
  );
}
