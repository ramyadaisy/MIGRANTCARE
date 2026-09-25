import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Check, Edit2, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface AIDocumentScannerProps {
  language: LanguageCode;
  onSaved?: () => void;
}

export const AIDocumentScanner: React.FC<AIDocumentScannerProps> = ({ language, onSaved }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("Diagnostic Lab Report");
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [editedEntities, setEditedEntities] = useState<any[]>([]);
  const [savingVerification, setSavingVerification] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndScan = async () => {
    if (!file) return;
    setUploading(true);
    setSuccessNotice(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_title", docTitle);
      formData.append("document_type", "Lab Report");

      const response = await ApiService.uploadDocument(formData);
      setExtractedData(response);
      setEditedEntities(response.extracted_entities || []);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please check the document format.");
    } finally {
      setUploading(false);
    }
  };

  const handleEntityValueChange = (index: number, val: string) => {
    const updated = [...editedEntities];
    updated[index].field_value = val;
    setEditedEntities(updated);
  };

  const handleSaveToRecord = async () => {
    if (!extractedData) return;
    setSavingVerification(true);

    try {
      await ApiService.verifyEntities(extractedData.document_id, editedEntities);
      setSuccessNotice("Verified lab information successfully saved into your official health record!");
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingVerification(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Philosophy Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Medical Document Scanner</h2>
            <p className="text-xs text-slate-500">
              Digitize paper clinic receipts, discharge slips, and lab tests into structured data with human verification.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Human-in-the-Loop Safety Rule:</strong> AI extracts candidate values from paper scans with confidence indicators. No AI information is committed to your permanent medical history until you review and verify it.
          </span>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successNotice}
        </div>
      )}

      {/* Upload Box */}
      {!extractedData && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
                Document Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                placeholder="e.g. Complete Blood Count / Chest X-ray"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="file"
                id="docUpload"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.txt"
                className="hidden"
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-blue-500 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {file ? file.name : "Select or Drop Medical Report / Prescription Photo"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, PDF or Text slips up to 10MB
                </span>
              </label>
            </div>

            <button
              onClick={handleUploadAndScan}
              disabled={!file || uploading}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold transition shadow-md ${
                !file || uploading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              {uploading ? "Analyzing Document with AI OCR..." : "Start AI OCR Extraction"}
            </button>
          </div>
        </div>
      )}

      {/* Verification Screen */}
      {extractedData && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                OCR Status: Processed
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {extractedData.document_title}
              </h3>
            </div>
            <button
              onClick={() => { setExtractedData(null); setFile(null); }}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl"
            >
              Upload Another
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Raw Optical Text Preview:</span>
            <pre className="mt-1 font-mono text-[11px] text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-200">
              {extractedData.raw_ocr_text}
            </pre>
          </div>

          {/* Extracted Fields with Confidence Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Candidate Lab Fields Extracted</span>
              <span className="text-slate-400 font-normal">Review & modify if needed</span>
            </h4>

            <div className="space-y-2.5">
              {editedEntities.map((entity, idx) => {
                const confPercent = Math.round(entity.confidence_score * 100);
                const isHighConf = confPercent >= 90;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="sm:w-1/3">
                      <span className="text-xs font-bold text-slate-800">{entity.field_name}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={entity.field_value}
                          onChange={(e) => handleEntityValueChange(idx, e.target.value)}
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Confidence Meter Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                          isHighConf
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {confPercent}% {isHighConf ? 'High' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {t.verifyBeforeSave}
            </p>
            <button
              onClick={handleSaveToRecord}
              disabled={savingVerification}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {savingVerification ? "Saving..." : "Verify & Save into Health Record"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
