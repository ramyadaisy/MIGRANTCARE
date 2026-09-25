import React from 'react';
import { Building2, Users, Bed, Calendar, FileText, CheckCircle2, Stethoscope } from 'lucide-react';
import { LanguageCode, translations } from '../locales/translations';

interface HospitalPortalProps {
  language: LanguageCode;
}

export const HospitalPortal: React.FC<HospitalPortalProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Victoria Government Hospital & Trauma Care</h2>
            <p className="text-xs text-slate-500">
              Facility Health ID verification and interstate migrant patient desk.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Government District Hub • Bengaluru
        </span>
      </div>

      {/* Hospital Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Migrant OPD Today</span>
          <div className="text-2xl font-black text-slate-900 mt-1">42</div>
          <span className="text-[10px] text-teal-600 font-semibold block mt-1">100% digital QR check-in</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Duty Clinicians</span>
          <div className="text-2xl font-black text-slate-900 mt-1">18</div>
          <span className="text-[10px] text-slate-500 mt-1 block">OPD & Trauma shifts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">General Bed Capacity</span>
          <div className="text-2xl font-black text-slate-900 mt-1">540 / 650</div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">110 beds available</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jan Aushadhi Stocks</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">98.2%</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Essential medicines stocked</span>
        </div>
      </div>

      {/* OPD Schedule & Clinical Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Migrant Worker Today's OPD Schedule
          </h3>
          <div className="space-y-3">
            {[
              { name: "Arun Kumar", hid: "MC-2026-001245", time: "10:30 AM", dept: "Occupational Medicine / Dust Allergy", status: "Consulted" },
              { name: "Sunil Soren", hid: "MC-2026-003819", time: "11:15 AM", dept: "Orthopedics / Lumbar Strain", status: "Waiting" },
              { name: "Babulal Das", hid: "MC-2026-004122", time: "11:45 AM", dept: "Audiometry / Noise Screening", status: "In Progress" },
              { name: "Mohammed Rafiq", hid: "MC-2026-009418", time: "01:00 PM", dept: "Tetanus Booster / Minor Wound", status: "Scheduled" },
            ].map((p, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{p.hid}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.dept}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'Consulted' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {p.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Verified Hospital Physicians
          </h3>
          <div className="space-y-3">
            {[
              { name: "Dr. Rajesh Kumar, MD", code: "DOC-9842", spec: "Internal & Occupational Medicine", room: "Room 104" },
              { name: "Dr. Ananya Sen, MS", code: "DOC-7712", spec: "Trauma & Orthopedic Surgery", room: "Room 208" },
              { name: "Dr. Farhan Qureshi, MD", code: "DOC-4481", spec: "Pulmonology & Respiratory Care", room: "Room 112" },
              { name: "Sister Mary Theresa", code: "STAFF-01", spec: "Migrant Helpdesk & Language Coordinator", room: "Desk A" },
            ].map((d, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.spec}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {d.room}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{d.code}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
