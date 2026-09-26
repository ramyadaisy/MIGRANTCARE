import React, { useEffect, useState } from 'react';
import { 
  Shield, QrCode, Pill, Calendar, Clock, AlertTriangle, 
  FileText, Activity, HardHat, History, Building2, Bot, 
  MapPin, ChevronRight, Volume2, Bell, CheckCircle2 
} from 'lucide-react';
import { ApiService } from '../services/api';
import { VoiceAssistant } from '../services/voice';
import { LanguageCode, translations } from '../locales/translations';

interface WorkerDashboardProps {
  language: LanguageCode;
  onNavigateTab: (tab: string) => void;
  onOpenPassport: () => void;
  onOpenPendingConsent: (request: any) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  language,
  onNavigateTab,
  onOpenPassport,
  onOpenPendingConsent
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [pendingConsents, setPendingConsents] = useState<any[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newCity, setNewCity] = useState("Bengaluru");
  const [newState, setNewState] = useState("Karnataka");
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  const loadData = async () => {
    try {
      setLoading(true);
      const [prof, tline, rxs, pendings] = await Promise.all([
        ApiService.getWorkerProfile(),
        ApiService.getTimeline(),
        ApiService.getPrescriptions(),
        ApiService.getPendingConsents()
      ]);
      setProfile(prof);
      setTimeline(tline);
      setPrescriptions(rxs);
      setPendingConsents(pendings);
      if (prof) {
        setNewCity(prof.current_city);
        setNewState(prof.current_state);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.updateMigration(newCity, newState);
      setShowLocationModal(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadSchedule = () => {
    if (!profile) return;
    const speech = `Health Passport summary for ${profile.full_name}. Health ID is ${profile.health_id}. Blood group is ${profile.blood_group}. Current location is ${profile.current_city}, ${profile.current_state}. Native state is ${profile.home_state}.`;
    VoiceAssistant.speak(speech, language);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Pending Consent Notification Banner */}
      {pendingConsents.length > 0 && (
        <div className="bg-amber-500 text-white rounded-3xl p-5 shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Doctor Access Request Pending</h3>
              <p className="text-xs text-amber-100">
                {pendingConsents[0].doctor_name} ({pendingConsents[0].hospital_name}) is requesting access to your health history.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenPendingConsent(pendingConsents[0])}
            className="px-5 py-2.5 rounded-2xl bg-white text-amber-950 font-bold text-xs hover:bg-amber-50 transition shadow-sm self-start sm:self-auto"
          >
            Review & Authorize
          </button>
        </div>
      )}

      {/* Visual Storytelling Banner: Mobility & Care Continuity */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-teal-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Active Migration Corridor
            </span>
            <h1 className="text-2xl font-black mt-1">
              {profile.full_name && profile.full_name !== 'Arun Kumar' 
                ? `${t.greeting}, ${profile.full_name} 👋` 
                : `${t.greeting} 👋`}
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Home: <strong>{profile.home_state}</strong></span>
              <span>→</span>
              <span>Currently in: <strong>{profile.current_city}, {profile.current_state}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReadSchedule}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Read Summary 🔊
            </button>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              Update Location 📍
            </button>
          </div>
        </div>

        {/* Mobility Flow Diagram Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold text-slate-300 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>ORIGIN: {profile.home_state}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>RELOCATION: {profile.current_city}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>HEALTH ID: {profile.health_id}</span>
          </div>
          <span>→</span>
          <div className="flex items-center gap-1 text-emerald-300 shrink-0 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>CONTINUOUS CARE</span>
          </div>
        </div>
      </div>

      {/* Hero Health Passport & Next Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Passport Mini Card with QR trigger */}
        <div 
          onClick={onOpenPassport}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.healthPassport}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-lg font-bold text-slate-900 mt-2">{profile.health_id}</div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{t.bloodGroup}: <strong className="text-rose-600">{profile.blood_group}</strong></span>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5">
              Show QR <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Next Medicine Card */}
        <div 
          onClick={() => onNavigateTab('prescriptions')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:border-teal-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.nextMedicine}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            Levocetirizine 5mg (Allergy)
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              09:00 PM (After Dinner)
            </span>
            <span className="text-xs font-bold text-teal-600 flex items-center gap-0.5">
              View <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Upcoming Appointment */}
        <div 
          onClick={() => onNavigateTab('facilities')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.upcomingAppointment}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2">
            Tomorrow • 10:00 AM
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 truncate max-w-[170px]">
              Victoria OPD • Room 104
            </span>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-0.5">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid (10 Essential Modules) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          {t.quickActions}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: "passport", label: t.actionHealthId, icon: QrCode, color: "text-blue-600 bg-blue-50 hover:bg-blue-100", action: onOpenPassport },
            { id: "records", label: t.actionRecords, icon: FileText, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100", action: () => onNavigateTab('records') },
            { id: "prescriptions", label: t.actionMedicines, icon: Pill, color: "text-teal-600 bg-teal-50 hover:bg-teal-100", action: () => onNavigateTab('prescriptions') },
            { id: "emergency", label: t.actionEmergency, icon: AlertTriangle, color: "text-rose-600 bg-rose-50 hover:bg-rose-100", action: () => onNavigateTab('emergency') },
            { id: "ocr", label: "Upload & AI OCR", icon: Shield, color: "text-purple-600 bg-purple-50 hover:bg-purple-100", action: () => onNavigateTab('ocr') },
            { id: "occupational", label: t.actionOccupational, icon: HardHat, color: "text-amber-600 bg-amber-50 hover:bg-amber-100", action: () => onNavigateTab('occupational') },
            { id: "trends", label: t.healthTrends, icon: Activity, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100", action: () => onNavigateTab('trends') },
            { id: "facilities", label: t.actionFacilities, icon: Building2, color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100", action: () => onNavigateTab('facilities') },
            { id: "ai", label: t.actionAI, icon: Bot, color: "text-violet-600 bg-violet-50 hover:bg-violet-100", action: () => onNavigateTab('ai') },
            { id: "history", label: t.actionAccessHistory, icon: History, color: "text-slate-600 bg-slate-100 hover:bg-slate-200", action: () => onNavigateTab('history') },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 flex flex-col items-center text-center transition shadow-sm hover:shadow"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2.5 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Records Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t.recentRecords}
          </h3>
          <button 
            onClick={() => onNavigateTab('records')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            View Complete Timeline <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {timeline.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.diagnosis}</span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
                    {item.record_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.hospital_name} • {item.doctor_name}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.recorded_date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Migration City Updater Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Relocate Health Passport</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateMigration} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Updating your current workplace city ensures local clinic recommendations and seamless cross-border hospital recognition without requiring new paperwork.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Workplace City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination State</label>
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 bg-slate-50"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  Confirm Relocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
