import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Stethoscope, Search, QrCode, Lock, Unlock, ShieldAlert, 
  CheckCircle2, Plus, Pill, AlertTriangle, Clock, Building, UserCheck 
} from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface DoctorPortalProps {
  language: LanguageCode;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ language }) => {
  const [searchHealthId, setSearchHealthId] = useState("MC-2026-001245");
  const [stats, setStats] = useState<any>(null);
  const [searchedWorker, setSearchedWorker] = useState<any>(null);
  const [authorizedData, setAuthorizedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [requestingConsent, setRequestingConsent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New consultation state
  const [diagnosis, setDiagnosis] = useState("Dust-Induced Bronchospasm");
  const [symptoms, setSymptoms] = useState("Cough, wheezing after shifting cement bags on site.");
  const [treatmentNotes, setTreatmentNotes] = useState("Advised dust respirator; continue steam inhalation.");
  const [newMedName, setNewMedName] = useState("Montelukast 10mg");
  const [newMedDose, setNewMedDose] = useState("10mg");
  const [newMedFreq, setNewMedFreq] = useState("0-0-1 (Night)");
  const [submittingRx, setSubmittingRx] = useState(false);

  const t = translations[language];

  const loadStats = async () => {
    try {
      const data = await ApiService.getDoctorDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSearch = async (hidToSearch?: string) => {
    const query = hidToSearch || searchHealthId;
    if (!query) return;
    setLoading(true);
    setNotice(null);
    setAuthorizedData(null);

    try {
      const result = await ApiService.doctorSearchWorker(query);
      setSearchedWorker(result);

      if (result.has_active_consent) {
        const fullRecords = await ApiService.doctorViewRecords(query);
        setAuthorizedData(fullRecords);
      }
    } catch (err: any) {
      alert(err.message || "Search failed");
      setSearchedWorker(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestConsent = async () => {
    if (!searchedWorker) return;
    setRequestingConsent(true);
    try {
      const res = await ApiService.doctorRequestConsent(
        searchedWorker.health_id,
        ['medical_history', 'prescriptions', 'lab_reports'],
        24
      );
      setNotice("Access request dispatched to worker phone. Waiting for approval.");
      await handleSearch(searchedWorker.health_id);
    } catch (err: any) {
      alert(err.message || "Failed to request access");
    } finally {
      setRequestingConsent(false);
    }
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedData) return;
    setSubmittingRx(true);

    try {
      await ApiService.doctorAddConsultation({
        worker_health_id: authorizedData.worker.health_id,
        diagnosis,
        symptoms,
        treatment_notes: treatmentNotes,
        medications: [
          {
            drug_name: newMedName,
            dosage: newMedDose,
            frequency: newMedFreq,
            timing: "After Dinner",
            duration_days: 7,
            instructions: "Take with warm water."
          }
        ]
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setNotice("Consultation and prescription successfully registered and pushed to worker's mobile passport!");
      
      // Refresh patient records
      const updatedRecords = await ApiService.doctorViewRecords(authorizedData.worker.health_id);
      setAuthorizedData(updatedRecords);
      await loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to save consultation");
    } finally {
      setSubmittingRx(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clinician Header Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Good morning, {stats?.doctor_name || "Dr. Rajesh Kumar"}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{stats?.specialization || "Internal Medicine"}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                {stats?.hospital_name || "Victoria Government Hospital, Bengaluru"}
              </span>
            </p>
          </div>
        </div>

        {/* Quick OPD Metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Requests</span>
            <span className="text-base font-extrabold text-amber-600">{stats?.pending_requests_count || 0}</span>
          </div>
          <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Passes</span>
            <span className="text-base font-extrabold text-teal-600">{stats?.active_consents_count || 1}</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {notice}
        </div>
      )}

      {/* Patient Health ID Lookup Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Patient Search or QR Scan
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchHealthId}
              onChange={(e) => setSearchHealthId(e.target.value)}
              placeholder="Enter Worker Health ID (e.g. MC-2026-001245)"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Lookup Patient"}
          </button>

          <button
            onClick={() => { setSearchHealthId("MC-2026-001245"); handleSearch("MC-2026-001245"); }}
            className="px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-100 transition flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            Simulate Scan (Arun Kumar)
          </button>
        </div>
      </div>

      {/* Search Result & Authorization Gate */}
      {searchedWorker && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
                  {searchedWorker.health_id}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                  Blood Group: {searchedWorker.blood_group}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{searchedWorker.full_name}</h3>
            </div>

            {/* Authorization Status Badge */}
            <div>
              {searchedWorker.has_active_consent ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Access • Active Token</span>
                </div>
              ) : searchedWorker.has_pending_request ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Access Request Pending Worker Approval</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Records Locked • Consent Required</span>
                </div>
              )}
            </div>
          </div>

          {/* Access Request Prompt if locked */}
          {!searchedWorker.has_active_consent && (
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-300 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                Medical Records are Protected by MigrantCare Privacy Protocol
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Under patient-controlled consent regulations, you must request explicit authorization from the worker before reviewing past medical history, lab reports, or prescriptions.
              </p>
              <button
                onClick={handleRequestConsent}
                disabled={requestingConsent || searchedWorker.has_pending_request}
                className={`px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition ${
                  searchedWorker.has_pending_request
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                {requestingConsent ? "Sending Request..." : searchedWorker.has_pending_request ? "Request Already Sent" : "Request 24-Hour OPD Access"}
              </button>
            </div>
          )}

          {/* Unlocked Patient Dashboard */}
          {authorizedData && (
            <div className="space-y-6 pt-2">
              {/* Allergy & Occupational Alert Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Critical Allergy Warning
                  </div>
                  <div className="text-sm font-black text-rose-900 mt-1">
                    {authorizedData.worker.critical_allergies}
                  </div>
                  <div className="text-xs text-rose-700 mt-0.5">
                    Condition: {authorizedData.worker.chronic_conditions}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Occupational Exposure Profile
                  </div>
                  <div className="text-sm font-bold text-amber-950 mt-1">
                    {authorizedData.worker.occupation} • {authorizedData.worker.current_city}
                  </div>
                  <div className="text-xs text-amber-800 mt-0.5">
                    Hazards: {authorizedData.worker.hazard_exposures.join(', ')}
                  </div>
                </div>
              </div>

              {/* Patient Timeline & Past Prescriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                    Cross-State Medical History ({authorizedData.timeline.length})
                  </h4>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {authorizedData.timeline.map((item: any) => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{item.diagnosis}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.recorded_date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1">{item.treatment_notes}</p>
                        <p className="text-slate-400 text-[10px] mt-1">Clinician: {item.doctor_name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Prescriptions */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                    Active & Past Prescriptions ({authorizedData.prescriptions.length})
                  </h4>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {authorizedData.prescriptions.map((rx: any) => (
                      <div key={rx.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{rx.diagnosis}</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {rx.medications.map((m: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                              {m.drug_name} ({m.frequency})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation & Digital Prescription Form */}
              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Issue New OPD Consultation & Digital Prescription
                </h4>

                <form onSubmit={handleSubmitConsultation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis</label>
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Observed Symptoms</label>
                      <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Treatment Notes & Work Advice</label>
                    <textarea
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  {/* Add Medication */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-800 block mb-2">Prescribed Medication</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          value={newMedName}
                          onChange={(e) => setNewMedName(e.target.value)}
                          placeholder="Medicine name"
                          className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newMedDose}
                          onChange={(e) => setNewMedDose(e.target.value)}
                          placeholder="Dosage (e.g. 500mg)"
                          className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newMedFreq}
                          onChange={(e) => setNewMedFreq(e.target.value)}
                          placeholder="Frequency (e.g. 1-0-1)"
                          className="w-full text-xs font-medium p-2 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRx}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                  >
                    {submittingRx ? "Recording Consultation..." : "Submit Consultation & Send Prescription to Passport"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
