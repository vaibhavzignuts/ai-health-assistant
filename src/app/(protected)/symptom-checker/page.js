'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, AlertTriangle, Clock, ArrowLeft, Loader2, Save, History, FileText } from 'lucide-react';
import { useProtectedUser } from '@/hooks/useProtectedUser';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('check');
  const [isSaving, setIsSaving] = useState(false);
  const { user, loading: authLoading } = useProtectedUser();
  const router = useRouter();

  useEffect(() => {
    if (user && activeTab === 'history') {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/symptom-history?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || !user) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms.trim(), userId: user.id }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setToast({ message: data.error || "Failed to analyze symptoms", type: 'error' });
      }
    } catch (error) {
      console.error("Error:", error);
      setToast({ message: "Failed to analyze symptoms. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/symptom-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          symptomsEntered: symptoms,
          aiAssessment: JSON.stringify(result.possibleConditions),
          urgencyLevel: result.urgencyLevel,
          recommendedNextStep: result.recommendedNextStep
        }),
      });
      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Assessment saved successfully!', type: 'success' });
        setResult(null);
        setSymptoms('');
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setToast({ message: 'Failed to save assessment', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAssessment = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/symptom-history?id=${confirmDelete}&userId=${user.id}`, { method: 'DELETE' });
      setToast({ message: 'Assessment deleted', type: 'success' });
      loadHistory();
    } catch (error) {
      console.error('Error deleting:', error);
      setToast({ message: 'Failed to delete assessment', type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  if (authLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal 
        isOpen={!!confirmDelete} 
        title="Delete Assessment" 
        message="Are you sure you want to delete this symptom assessment? This action cannot be undone." 
        confirmText="Delete" 
        isDestructive={true} 
        onConfirm={deleteAssessment} 
        onCancel={() => setConfirmDelete(null)} 
      />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/dashboard')} className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-lg shadow-sm border border-slate-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Symptom Checker</h1>
              <p className="text-sm text-slate-500">Get safe, AI-powered health guidance</p>
            </div>
          </div>
        </div>

        <Alert variant="warning" title="Important Medical Disclaimer">
          This AI tool provides general health information only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
        </Alert>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab('check')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'check' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <Stethoscope className="h-4 w-4 mr-2" /> New Check
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'history' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <History className="h-4 w-4 mr-2" /> Assessment History
          </button>
        </div>

        {activeTab === 'check' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {!result ? (
                <Card>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Describe Your Symptoms</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., I've had a severe headache and mild nausea for the past 2 days..."
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading || !symptoms.trim()}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex justify-center items-center disabled:opacity-50"
                    >
                      {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</> : <><Stethoscope className="h-5 w-5 mr-2" /> Analyze Symptoms</>}
                    </button>
                  </form>
                </Card>
              ) : (
                <Card className="space-y-6 border-primary-200 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Analysis Complete</h3>
                      <p className="text-sm text-slate-500 mt-1">AI-generated health information — not a diagnosis.</p>
                    </div>
                    <Badge variant={
                      result.urgencyLevel === 'emergency' ? 'emergency' :
                      result.urgencyLevel === 'urgent' ? 'warning' : 'success'
                    }>
                      {result.urgencyLevel.toUpperCase()}
                    </Badge>
                  </div>

                  {result.urgencyLevel === 'emergency' && (
                    <Alert variant="danger" title="Emergency">
                      {result.recommendedNextStep}
                    </Alert>
                  )}
                  {result.urgencyLevel === 'urgent' && (
                    <Alert variant="warning" title="Urgent">
                      {result.recommendedNextStep}
                    </Alert>
                  )}
                  {result.urgencyLevel === 'routine' && (
                    <Alert variant="info" title="Routine">
                      {result.recommendedNextStep}
                    </Alert>
                  )}

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Possible causes to discuss with a healthcare professional:</h4>
                    <ul className="list-disc ml-5 text-slate-700 space-y-1">
                      {result.possibleConditions.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  {result.warningSigns && result.warningSigns.length > 0 && (
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                      <h4 className="font-semibold text-rose-900 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" /> Seek immediate attention if:
                      </h4>
                      <ul className="list-disc ml-5 text-rose-800 text-sm space-y-1">
                        {result.warningSigns.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4 border-t border-slate-100">
                    <button onClick={() => { setResult(null); setSymptoms(''); }} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Start Over</button>
                    <button onClick={saveAssessment} disabled={isSaving} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Assessment
                    </button>
                  </div>
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
              <Card className="bg-blue-50 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" /> When to call 911</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Severe chest pain or pressure</li>
                  <li>• Difficulty breathing</li>
                  <li>• Sudden numbness or weakness</li>
                  <li>• Severe bleeding</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map(item => (
                <Card key={item.id} className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary-500" />
                        <span className="text-sm text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={
                        item.urgency_level === 'emergency' ? 'emergency' :
                        item.urgency_level === 'urgent' ? 'warning' : 'default'
                      }>
                        {item.urgency_level}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700">Symptoms:</h4>
                      <p className="text-slate-900 mt-1">&quot;{item.symptoms_entered}&quot;</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-700 font-medium">{item.recommended_next_step}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmDelete(item.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-2 md:mt-0 mt-2">
                    Delete
                  </button>
                </Card>
              ))
            ) : (
              <EmptyState title="No past assessments" description="Your saved symptom checks will appear here." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
