import React, { useEffect, useState } from 'react';
import { Pill, Volume2, Clock, Calendar, CheckCircle2, Bell, AlertCircle, FileText } from 'lucide-react';
import { ApiService } from '../services/api';
import { VoiceAssistant } from '../services/voice';
import { LanguageCode, translations } from '../locales/translations';

interface PrescriptionVaultProps {
  language: LanguageCode;
}

export const PrescriptionVault: React.FC<PrescriptionVaultProps> = ({ language }) => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rxs, rems] = await Promise.all([
          ApiService.getPrescriptions(),
          ApiService.getReminders()
        ]);
        setPrescriptions(rxs);
        setReminders(rems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReadAloud = (prescription: any) => {
    setSpeakingId(prescription.id);
    
    // Construct localized natural speech script
    const medDescriptions = prescription.medications.map((m: any) => 
      `${m.drug_name}, ${m.dosage}, schedule ${m.frequency}, ${m.timing} for ${m.duration_days} days. ${m.instructions || ''}`
    ).join('. ');

    const fullScript = `Prescription for ${prescription.diagnosis}. Prescribed by ${prescription.doctor_name} at ${prescription.hospital_name}. Medicines: ${medDescriptions}. Important instructions: ${prescription.notes || 'Take as advised.'}`;

    VoiceAssistant.speak(fullScript, language);

    setTimeout(() => {
      setSpeakingId(null);
    }, 12000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Digital Prescription Vault</h2>
            <p className="text-xs text-slate-500">
              Clear digital prescriptions with dosage schedules and audio translation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => VoiceAssistant.stopSpeaking()}
            className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            Stop Audio ⏹️
          </button>
        </div>
      </div>

      {/* Medication Reminder Alerts */}
      {reminders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-teal-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-teal-200" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-100">Scheduled Medicine Alarms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reminders.map((rem) => (
              <div key={rem.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">{rem.medication_name}</div>
                  <div className="text-[11px] text-teal-100">{rem.dosage} • {rem.timing_label}</div>
                </div>
                <div className="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-mono font-bold">
                  {rem.reminder_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Cards List */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">No prescriptions found yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When a verified doctor consults with you and provides digital medicines, they will appear here with audio instructions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Prescription
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5">{rx.diagnosis}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Prescribed by <strong className="text-slate-800">{rx.doctor_name}</strong> • {rx.hospital_name}
                  </p>
                </div>

                {/* Read Aloud Button */}
                <button
                  onClick={() => handleReadAloud(rx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                    speakingId === rx.id
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {speakingId === rx.id ? "Reading Aloud..." : t.readAloud}
                </button>
              </div>

              {/* Medications Table / Cards */}
              <div className="mt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Prescribed Medicines ({rx.medications.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rx.medications.map((med: any) => (
                    <div key={med.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{med.drug_name}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                            {med.dosage}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Frequency: <strong className="text-slate-800">{med.frequency}</strong></span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Timing: <strong className="text-slate-800">{med.timing}</strong></span>
                        </div>
                      </div>
                      {med.instructions && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                          "{med.instructions}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Doctor Notes: </span>
                    {rx.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
