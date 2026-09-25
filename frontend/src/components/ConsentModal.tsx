import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Clock, CheckSquare, XCircle, AlertTriangle, Building, Stethoscope } from 'lucide-react';
import { LanguageCode, translations } from '../locales/translations';

interface ConsentModalProps {
  request: {
    id: number;
    doctor_name: string;
    hospital_name: string;
    specialization: string;
    requested_scopes: string[];
    duration_hours: number;
  };
  language: LanguageCode;
  onApprove: (requestId: number, scopes: string[], durationHours: number) => Promise<void>;
  onDecline: (requestId: number) => void;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  request,
  language,
  onApprove,
  onDecline,
  onClose
}) => {
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    request.requested_scopes && request.requested_scopes.length > 0 
      ? request.requested_scopes 
      : ['medical_history', 'prescriptions']
  );
  const [duration, setDuration] = useState<number>(request.duration_hours || 24);
  const [submitting, setSubmitting] = useState(false);
  const t = translations[language];

  const handleToggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      if (selectedScopes.length > 1) {
        setSelectedScopes(selectedScopes.filter(s => s !== scope));
      }
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(request.id, selectedScopes, duration);
      // Trigger joyful microinteraction confetti
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-teal-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Health Record Access Request</h3>
              <p className="text-xs text-blue-100">Permission-based clinician authorization</p>
            </div>
          </div>
        </div>

        {/* Doctor Info Card */}
        <div className="p-6 space-y-5">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{request.doctor_name}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {request.hospital_name}
                </p>
                <span className="inline-block mt-1 text-[11px] font-medium text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                  {request.specialization}
                </span>
              </div>
            </div>
          </div>

          {/* Granular Scopes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Information to Share:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes('medical_history')}
                  onChange={() => handleToggleScope('medical_history')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Medical History & Past Visits</div>
                  <div className="text-[11px] text-slate-500">Previous diagnoses and hospital consultations from other states</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes('prescriptions')}
                  onChange={() => handleToggleScope('prescriptions')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Prescriptions & Active Medications</div>
                  <div className="text-[11px] text-slate-500">Helps prevent drug interactions and duplicate prescriptions</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes('lab_reports')}
                  onChange={() => handleToggleScope('lab_reports')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Lab Diagnostic Reports & OCR Scans</div>
                  <div className="text-[11px] text-slate-500">Blood tests, chest X-rays, and baseline vitals</div>
                </div>
              </label>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Access Duration (Auto-Expires):
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={1}>1 hour (Quick OPD Consultation)</option>
              <option value={12}>12 hours (Day Care / Observation)</option>
              <option value={24}>24 hours (Recommended Standard)</option>
              <option value={168}>7 days (Multi-day Follow-up)</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              You have full ownership of your data. You can cancel or revoke this doctor's access at any time with 1 tap from your <strong>Access History</strong>.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => onDecline(request.id)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
          >
            {t.decline}
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" />
            {submitting ? "Granting..." : t.allowAccess}
          </button>
        </div>
      </div>
    </div>
  );
};
