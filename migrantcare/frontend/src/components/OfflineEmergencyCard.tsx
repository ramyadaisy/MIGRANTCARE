import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, Shield, HeartPulse, User, WifiOff, Volume2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { VoiceAssistant } from '../services/voice';
import { LanguageCode, translations } from '../locales/translations';

interface OfflineEmergencyCardProps {
  language: LanguageCode;
}

export const OfflineEmergencyCard: React.FC<OfflineEmergencyCardProps> = ({ language }) => {
  const [profile, setProfile] = useState<any>(null);
  const t = translations[language];

  useEffect(() => {
    // Read from cached offline storage first for zero-network resilience
    const cached = ApiService.getOfflineEmergencyProfile();
    setProfile(cached);

    // Also attempt fresh fetch if network exists
    ApiService.getWorkerProfile().then(fresh => {
      if (fresh && fresh.emergency_profile) {
        setProfile({
          health_id: fresh.health_id,
          full_name: fresh.full_name,
          blood_group: fresh.blood_group,
          ...fresh.emergency_profile
        });
      }
    }).catch(() => {
      // Offline fallback already loaded
    });
  }, []);

  if (!profile) return null;

  const handleReadEmergency = () => {
    const speech = `Emergency medical summary. Patient name: ${profile.full_name}. Blood group: ${profile.blood_group}. Critical allergies: ${profile.critical_allergies}. Important condition: ${profile.chronic_conditions}. Emergency contact: ${profile.emergency_contact_name}, telephone ${profile.emergency_contact_phone}. ${profile.special_instructions || ''}`;
    VoiceAssistant.speak(speech, language);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Offline Status Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs">
        <span className="flex items-center gap-1.5 text-slate-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          Offline Ready • Cached on Device
        </span>
        <button
          onClick={handleReadEmergency}
          className="text-teal-300 hover:text-teal-200 flex items-center gap-1 font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Read Aloud
        </button>
      </div>

      {/* High-Contrast Red Emergency Card */}
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden">
        {/* Urgent Header */}
        <div className="bg-rose-600 p-6 text-white text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="w-6 h-6 text-white emergency-pulse" />
            <span className="text-xs font-black uppercase tracking-widest bg-rose-700/80 px-3 py-1 rounded-full border border-rose-400/40">
              {t.emergencyCardTitle}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">{profile.full_name}</h2>
          <p className="text-xs font-mono font-bold text-rose-100 tracking-wider mt-0.5">
            Health ID: {profile.health_id}
          </p>
        </div>

        {/* Vital Lifesaving Metrics Grid */}
        <div className="p-6 space-y-4 bg-slate-50">
          {/* Blood Group Hero */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t.bloodGroup}
                </span>
                <div className="text-2xl font-black text-rose-600">{profile.blood_group}</div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {profile.organ_donor ? "Organ Donor: Yes" : "Standard"}
            </span>
          </div>

          {/* Critical Allergies Box */}
          <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-200">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {t.criticalAllergies}
            </span>
            <p className="text-base font-extrabold text-rose-900 mt-1">
              {profile.critical_allergies}
            </p>
          </div>

          {/* Chronic / Ongoing Conditions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.chronicConditions}
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {profile.chronic_conditions}
            </p>
          </div>

          {profile.special_instructions && (
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900">
              <strong className="block mb-0.5 text-amber-800">Special Paramedic Instructions:</strong>
              {profile.special_instructions}
            </div>
          )}

          {/* 1-Tap Emergency Contact Phone Call Trigger */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              {t.emergencyContact}
            </span>
            <div className="text-sm font-bold text-emerald-950 mt-0.5">
              {profile.emergency_contact_name} ({profile.emergency_contact_relation || 'Family'})
            </div>
            <div className="font-mono text-xs text-emerald-800 font-semibold mt-0.5">
              {profile.emergency_contact_phone}
            </div>

            <a
              href={`tel:${profile.emergency_contact_phone.replace(/[^0-9+]/g, '')}`}
              className="mt-3 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
            >
              <Phone className="w-4 h-4" />
              {t.callContact}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
