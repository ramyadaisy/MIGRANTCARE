import React, { useEffect, useState } from 'react';
import { 
  FileText, Calendar, Building, Stethoscope, ChevronRight, 
  Activity, Syringe, Plus, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface MedicalTimelineViewProps {
  language: LanguageCode;
}

export const MedicalTimelineView: React.FC<MedicalTimelineViewProps> = ({ language }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New record input fields
  const [recordType, setRecordType] = useState("Consultation");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const t = translations[language];

  const loadTimeline = async () => {
    try {
      const data = await ApiService.getTimeline();
      setTimeline(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) return;

    setSaving(true);
    try {
      await ApiService.addMedicalRecord({
        record_type: recordType,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim(),
        treatment_notes: treatmentNotes.trim(),
        doctor_name: doctorName.trim() || "Attending Physician",
        hospital_name: hospitalName.trim() || "Healthcare Center",
        recorded_date: recordedDate
      });
      setShowAddModal(false);
      setDiagnosis("");
      setSymptoms("");
      setTreatmentNotes("");
      await loadTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterType === "All" 
    ? timeline 
    : timeline.filter(t => t.record_type.toLowerCase().includes(filterType.toLowerCase()));

  const getRecordIcon = (type: string) => {
    if (type.includes("Vaccine")) return <Syringe className="w-5 h-5 text-emerald-600" />;
    if (type.includes("Lab")) return <Activity className="w-5 h-5 text-indigo-600" />;
    return <Stethoscope className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interstate Medical Timeline</h2>
            <p className="text-xs text-slate-500">
              Chronological clinical history connecting visits across hospitals and states.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Medical Record
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["All", "Consultation", "Lab Test", "Vaccine", "Hospital Visit"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterType === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No medical records in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You can manually log past doctor visits, vaccinations, and hospital checkups, or upload paper reports via the AI scanner.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
          >
            Add First Medical Record
          </button>
        </div>
      ) : (
        /* Vertical Interactive Timeline */
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="relative cursor-pointer group"
            >
              {/* Timeline bullet dot */}
              <div className="absolute -left-6 sm:-left-8 top-4 w-7 h-7 rounded-xl bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 group-hover:border-blue-500 group-hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                      {getRecordIcon(item.record_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {item.record_type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {item.recorded_date}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {item.diagnosis}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.hospital_name} • {item.doctor_name}</span>
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition shrink-0 mt-2" />
                </div>

                {item.treatment_notes && (
                  <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 line-clamp-2">
                    {item.treatment_notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Add Medical Record / Past Visit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Record Type</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    <option value="Consultation">Doctor Consultation</option>
                    <option value="Lab Test">Lab Diagnostic Test</option>
                    <option value="Hospital Visit">Hospital Visit / OPD</option>
                    <option value="Vaccination">Vaccination / Immunization</option>
                    <option value="Injury Report">Workplace Injury Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Visit</label>
                  <input
                    type="date"
                    value={recordedDate}
                    onChange={(e) => setRecordedDate(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnosis / Health Condition *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Bronchitis, Fever, Tetanus Shot, Routine Checkup"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Presenting Symptoms</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Cough for 2 weeks, throat irritation"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Notes & Doctor Advice</label>
                <textarea
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Steam inhalation prescribed; advise dust mask at construction site"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Facility</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Primary Health Center"
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {saving ? "Saving..." : "Save to Timeline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-900/50 px-2 py-0.5 rounded">
                  {selectedItem.record_type}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedItem.diagnosis}</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Consultation Date</span>
                <span className="font-mono font-bold text-slate-800">{selectedItem.recorded_date}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Attending Clinician</span>
                <span className="font-bold text-slate-800">{selectedItem.doctor_name}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Facility / Clinic</span>
                <span className="font-bold text-slate-800">{selectedItem.hospital_name}</span>
              </div>

              {selectedItem.symptoms && (
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Presenting Symptoms
                  </span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                    {selectedItem.symptoms}
                  </p>
                </div>
              )}

              {selectedItem.treatment_notes && (
                <div>
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Treatment Notes & Doctor Advice
                  </span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                    {selectedItem.treatment_notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
