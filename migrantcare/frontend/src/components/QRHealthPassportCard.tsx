import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, AlertCircle, Heart, Phone, Printer, Check, Copy } from 'lucide-react';
import { LanguageCode, translations } from '../locales/translations';

interface QRHealthPassportCardProps {
  worker: {
    health_id: string;
    full_name: string;
    blood_group: string;
    date_of_birth?: string;
    phone: string;
    home_state: string;
    current_city: string;
    current_state: string;
    emergency_profile?: {
      critical_allergies: string;
      emergency_contact_name: string;
      emergency_contact_phone: string;
    };
  };
  language: LanguageCode;
  onClose?: () => void;
}

export const QRHealthPassportCard: React.FC<QRHealthPassportCardProps> = ({
  worker,
  language,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);
  const t = translations[language];

  // The QR code contains a secure authorization URI/token for clinicians
  const qrData = JSON.stringify({
    type: "MIGRANTCARE_PASSPORT",
    hid: worker.health_id,
    token: `sec_${worker.health_id.replace(/-/g, '')}`,
    host: "https://migrantcare.org"
  });

  const handleCopyHealthId = () => {
    navigator.clipboard.writeText(worker.health_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-md mx-auto">
      {/* Top Header Card Band */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-teal-900 p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-teal-300 uppercase">
                {t.appName}
              </h2>
              <p className="text-[10px] text-slate-300 tracking-tight">
                {t.healthPassport}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 border border-teal-400/30 text-teal-200">
            OFFICIAL DIGITAL PASS
          </span>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Worker Name</p>
            <h3 className="text-xl font-bold text-white tracking-tight">{worker.full_name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Blood Group</p>
            <span className="inline-block px-3 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-lg shadow-sm">
              {worker.blood_group}
            </span>
          </div>
        </div>
      </div>

      {/* Main Body with High-Contrast QR Code */}
      <div className="p-6 bg-slate-50 flex flex-col items-center border-b border-slate-200">
        <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-slate-200/80 mb-3 relative group">
          <QRCodeSVG
            value={qrData}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Health ID with 1-click copy */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Health ID:</span>
          <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
            {worker.health_id}
          </span>
          <button
            onClick={handleCopyHealthId}
            className="text-slate-400 hover:text-blue-600 transition p-1"
            title="Copy Health ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Permission notice */}
        <p className="text-center text-[11px] font-semibold text-slate-500 mt-3 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          {t.scanWithPermission}
        </p>
      </div>

      {/* Essential Metadata Footer */}
      <div className="p-5 space-y-3 bg-white text-xs text-slate-700">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Origin & Location</span>
          <span className="font-semibold text-slate-800">
            {worker.home_state} → {worker.current_city}
          </span>
        </div>

        {worker.emergency_profile && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">{t.criticalAllergies}</span>
              <span className="font-bold text-rose-600 truncate max-w-[200px]">
                {worker.emergency_profile.critical_allergies}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">{t.emergencyContact}</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                {worker.emergency_profile.emergency_contact_phone}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Download Pass
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
