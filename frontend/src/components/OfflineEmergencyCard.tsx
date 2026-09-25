import React, { useEffect, useState } from 'react';
import { AlertTriangle, Phone, Shield, HeartPulse, User, WifiOff, Volume2, Edit3, Check } from 'lucide-react';
import { ApiService } from '../services/api';
import { VoiceAssistant } from '../services/voice';
import { LanguageCode, translations } from '../locales/translations';

interface OfflineEmergencyCardProps {
  language: LanguageCode;
}

export const OfflineEmergencyCard: React.FC<OfflineEmergencyCardProps> = ({ language }) => {
  const [profile, setProfile] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit states
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('Family');
  const [contactPhone, setContactPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const t = translations[language];

  const reloadProfile = () => {
    const cached = ApiService.getOfflineEmergencyProfile();
    setProfile(cached);
    if (cached) {
      setBloodGroup(cached.blood_group || 'O+');
      setAllergies(cached.critical_allergies || '');
      setConditions(cached.chronic_conditions || '');
      setContactName(cached.emergency_contact_name || '');
      setContactPhone(cached.emergency_contact_phone || '');
      setInstructions(cached.special_instructions || '');
    }

    ApiService.getWorkerProfile().then(fresh => {
      if (fresh && fresh.emergency_profile) {
        const fullProf = {
          health_id: fresh.health_id,
          full_name: fresh.full_name,
          blood_group: fresh.blood_group,
          ...fresh.emergency_profile
        };
        setProfile(fullProf);
        setBloodGroup(fullProf.blood_group || 'O+');
        setAllergies(fullProf.critical_allergies || '');
        setConditions(fullProf.chronic_conditions || '');
        setContactName(fullProf.emergency_contact_name || '');
        setContactPhone(fullProf.emergency_contact_phone || '');
        setInstructions(fullProf.special_instructions || '');
      }
    }).catch(() => {});
  };

  useEffect(() => {
    reloadProfile();
  }, []);

  const handleSaveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ApiService.updateEmergencyProfile({
        blood_group: bloodGroup,
        critical_allergies: allergies.trim() || "None reported",
        chronic_conditions: conditions.trim() || "None reported",
        emergency_contact_name: contactName.trim() || "Emergency Contact",
        emergency_contact_relation: contactRelation,
        emergency_contact_phone: contactPhone.trim(),
        special_instructions: instructions.trim()
      });
      setShowEditModal(false);
      reloadProfile();
    } catch (err) {
      console.error(err);
      alert("Failed to update emergency profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  const handleReadEmergency = () => {
    const speech = `Emergency medical summary. Patient name: ${profile.full_name}. Blood group: ${profile.blood_group}. Critical allergies: ${profile.critical_allergies}. Important condition: ${profile.chronic_conditions}. Emergency contact: ${profile.emergency_contact_name}, telephone ${profile.emergency_contact_phone}. ${profile.special_instructions || ''}`;
    VoiceAssistant.speak(speech, language);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Offline Status Badge & Edit Trigger */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs">
        <span className="flex items-center gap-1.5 text-slate-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          Offline Ready • Cached on Device
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="text-teal-300 hover:text-teal-200 flex items-center gap-1 font-semibold px-2 py-1 rounded bg-white/10"
          >
            <Edit3 className="w-3 h-3" />
            Edit Card
          </button>
          <button
            onClick={handleReadEmergency}
            className="text-white hover:text-teal-200 flex items-center gap-1 font-semibold px-2 py-1 rounded bg-teal-600"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Read Aloud
          </button>
        </div>
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

            {profile.emergency_contact_phone && (
              <a
                href={`tel:${profile.emergency_contact_phone.replace(/[^0-9+]/g, '')}`}
                className="mt-3 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <Phone className="w-4 h-4" />
                {t.callContact}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit Emergency Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Edit Emergency Health Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEmergency} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Relation</label>
                  <input
                    type="text"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    placeholder="e.g. Brother, Spouse"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Critical Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Severe Penicillin Allergy, Sulfa Drugs"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Important Chronic Conditions</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension, Diabetes"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Paramedic Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Carry inhaler; do NOT administer penicillin"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  {saving ? "Saving..." : "Save Emergency Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
