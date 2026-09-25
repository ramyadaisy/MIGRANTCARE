import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { Activity, Plus, Heart, Scale, Droplet, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface HealthTrendsViewProps {
  language: LanguageCode;
}

export const HealthTrendsView: React.FC<HealthTrendsViewProps> = ({ language }) => {
  const [screenings, setScreenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New entry form state
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [glucose, setGlucose] = useState(95);
  const [weight, setWeight] = useState(66.5);
  const [height, setHeight] = useState(172.0);
  const [submitting, setSubmitting] = useState(false);

  const t = translations[language];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getScreenings();
      setScreenings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiService.addScreening({
        systolic_bp: Number(systolic),
        diastolic_bp: Number(diastolic),
        pulse_rate: 74,
        blood_glucose: Number(glucose),
        weight_kg: Number(weight),
        height_cm: Number(height)
      });
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.healthTrends}</h2>
            <p className="text-xs text-slate-500">
              Interactive vital monitoring across migration transitions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Vitals Screening
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-slate-900">Blood Pressure Trend (mmHg)</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Target: &lt;120/80
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={screenings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="screening_date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[60, 160]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="systolic_bp" name="Systolic (Top)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="diastolic_bp" name="Diastolic (Bottom)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fasting Blood Sugar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Fasting Blood Glucose (mg/dL)</h3>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
              Normal: 70–100 mg/dL
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={screenings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="screening_date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[60, 150]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="blood_glucose" name="Glucose (mg/dL)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#glucoseGradient)" dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Vitals Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Record Vitals Screening</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddVitals} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    placeholder="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fasting Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  placeholder="98"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {submitting ? "Saving..." : "Save Screening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
