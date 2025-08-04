"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Heart,
  Loader2,
  History,
  AlertCircle,
  Info,
} from "lucide-react";
import { getCurrentUser } from "../../../lib/auth";
import { useSymptomAnalyzer } from "../../../hooks/useSymptomAnalyzer";
import Loader from "@/components/ui/Loader";
import { useProtectedUser } from "@/hooks/useProtectedUser";

export default function SymptomCheckerPage() {

  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
   const { user, loading:autLoading } = useProtectedUser()
  const router = useRouter();

if(autLoading){
  return <Loader/>
}



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || !user) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
       
      } else {
        alert(data.error || "Failed to analyze symptoms");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault()
  //     await analyzeSymptoms(symptoms, user.id)
  //   }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "emergency":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      case "medium":
        return <Info className="h-5 w-5" />;
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      case "emergency":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 mr-8 font-semibold hover:bg-gray-200 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl shadow-xl">
                <Stethoscope className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  AI Symptom Checker
                </h1>
                <p className="text-lg text-gray-700 font-medium">
                  Get AI-powered health insights instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-100 border-l-8 border-yellow-500 rounded-2xl shadow-xl p-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-yellow-900 mb-2">
                Important Medical Disclaimer
              </p>
              <p className="text-base text-yellow-800 leading-relaxed">
                This AI tool provides general health information only and should
                not replace professional medical advice. Always consult with a
                healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Symptom Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Describe Your Symptoms
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    What symptoms are you experiencing?
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms in detail..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include details like when symptoms started, their severity,
                    and any triggers.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-5 w-5" />
                      <span>Analyze Symptoms</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 bg-white rounded-3xl shadow-lg border p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Analysis Results
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full border text-sm font-semibold flex items-center gap-2 ${getSeverityColor(
                      result.severity
                    )}`}
                  >
                    {getSeverityIcon(result.severity)}
                    <span className="capitalize">
                      {result.severity} Priority
                    </span>
                  </div>
                </div>

                {/* Conditions */}
                {result.possibleConditions?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Possible Conditions:
                    </h4>
                    <ul className="list-disc list-inside text-base text-gray-800 space-y-1">
                      {result.possibleConditions.map((condition, idx) => (
                        <li key={idx}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations && (
                  <div className="space-y-5">
                    {result.recommendations.immediate?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Immediate Actions:
                        </h4>
                        <ul className="list-disc ml-5 text-base text-gray-800 space-y-1">
                          {result.recommendations.immediate.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendations.general?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          General Care:
                        </h4>
                        <ul className="list-disc list-inside text-base text-gray-800 space-y-1">
                          {result.recommendations.general.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendations.whenToSeekHelp && (
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-1">
                          When to Seek Help:
                        </h4>
                        <p className="text-base text-blue-800">
                          {result.recommendations.whenToSeekHelp}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Warning Signs */}
                {result.warningSigns?.length > 0 && (
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Seek Immediate Medical Attention If:
                    </h4>
                    <ul className="list-disc list-inside text-base text-red-800 space-y-1">
                      {result.warningSigns.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700 italic">
                  {result.disclaimer}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-8">
        

            {/* Emergency Numbers */}
            <div className="bg-red-100 border border-red-200 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Emergency Numbers
              </h3>
              <div className="space-y-2 text-base">
                <div className="flex justify-between text-red-800">
                  <span>Ambulance:</span>
                  <a href="tel:102" className="text-red-700 font-semibold">
                    102
                  </a>
                </div>
                <div className="flex justify-between text-red-800">
                  <span>Fire:</span>
                  <a href="tel:101" className="text-red-700 font-semibold">
                    101
                  </a>
                </div>
                <div className="flex justify-between text-red-800">
                  <span>Police:</span>
                  <a href="tel:100" className="text-red-700 font-semibold">
                    100
                  </a>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-100 border border-blue-300 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                Tips for Better Results
              </h3>
              <ul className="text-base text-blue-800 space-y-2">
                <li className="flex gap-2 items-start">
                  <span>•</span>
                  <span>Describe symptoms in detail</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span>•</span>
                  <span>Mention when symptoms started</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span>•</span>
                  <span>Include severity and triggers</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span>•</span>
                  <span>Always consult a doctor for serious concerns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
