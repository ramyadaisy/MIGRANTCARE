import React, { useState, useEffect } from 'react';
import { HardHat, Factory, Tractor, Truck, Utensils, Home, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface OccupationalHealthViewProps {
  language: LanguageCode;
}

export const OccupationalHealthView: React.FC<OccupationalHealthViewProps> = ({ language }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Construction");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const t = translations[language];

  useEffect(() => {
    ApiService.getWorkerProfile().then(prof => {
      if (prof && prof.occupational_profile && prof.occupational_profile.primary_industry) {
        setSelectedIndustry(prof.occupational_profile.primary_industry);
      }
    }).catch(() => {});
  }, []);

  const industries = [
    { id: "Construction", name: "Construction & Civil Works", icon: HardHat, color: "text-amber-600 bg-amber-50" },
    { id: "Factory", name: "Factory & Manufacturing", icon: Factory, color: "text-blue-600 bg-blue-50" },
    { id: "Agriculture", name: "Agriculture & Plantation", icon: Tractor, color: "text-emerald-600 bg-emerald-50" },
    { id: "Transport", name: "Logistics & Transport", icon: Truck, color: "text-indigo-600 bg-indigo-50" },
    { id: "Hospitality", name: "Hospitality & Food Services", icon: Utensils, color: "text-rose-600 bg-rose-50" },
    { id: "Domestic", name: "Domestic & Cleaning Work", icon: Home, color: "text-teal-600 bg-teal-50" },
  ];

  const hazardMap: Record<string, { risks: string[]; screenings: string[]; guidance: string }> = {
    Construction: {
      risks: [
        "Inhalation of silica & cement dust",
        "High continuous acoustic noise from jackhammers & mixers (>85dB)",
        "Repetitive heavy spinal loading & lumbar strain",
        "Puncture wounds from rusted rebar & wire nails"
      ],
      screenings: [
        "Spirometry / Lung function peak flow test",
        "Pure-tone audiometry screening",
        "Tetanus Toxoid (TT) vaccination booster status",
        "Visual acuity & refractive check"
      ],
      guidance: "Wear certified dust mask (N95 or particulate filter). Wear hearing protection near diesel generators. Never skip steel-toe footwear on active decks."
    },
    Factory: {
      risks: [
        "Solvent and synthetic dye fumes",
        "High-temperature boiler exposure",
        "Repetitive motion strain (assembly line carpel tunnel)",
        "Shift-work circadian disruption"
      ],
      screenings: [
        "Contact dermatitis skin evaluation",
        "Periodic audiometric checkup",
        "Blood pressure & resting heart rate curve",
        "Ergonomic postural assessment"
      ],
      guidance: "Use chemical-resistant nitrile gloves when handling lubricants or degreasers. Take 2-minute micro-stretches every 90 minutes."
    },
    Agriculture: {
      risks: [
        "Organophosphate pesticide & fertilizer mist",
        "Direct thermal heat stroke during noon harvesting",
        "Musculoskeletal stooping posture",
        "Zoonotic and insect vector exposures"
      ],
      screenings: [
        "Cholinesterase baseline monitoring if spraying pesticides",
        "Hydration & renal function (Creatinine check)",
        "Spine & knee joint flexibility check",
        "Anti-venom protocol awareness"
      ],
      guidance: "Avoid pesticide mixing during peak wind hours. Always use clean PPE mask and face shield. Drink at least 3 liters of salted hydration water daily."
    },
    Transport: {
      risks: [
        "Whole-body vehicle vibration",
        "Prolonged sedentary seating",
        "Irregular highway diet and hypertension",
        "Night highway glare & eye fatigue"
      ],
      screenings: [
        "Blood pressure & fasting blood sugar monitoring",
        "Ophthalmology night vision & depth perception",
        "Lumbar spine MRI / clinical assessment"
      ],
      guidance: "Stop vehicle every 3 hours for 10 minutes of active walking. Keep lumbar pillow support behind driver seat."
    },
    Hospitality: {
      risks: [
        "Prolonged standing on hard tile floors",
        "Scald and thermal steam burn exposures",
        "High thermal variation (walk-in freezers to stove ranges)"
      ],
      screenings: [
        "Lower extremity venous varicose vein screening",
        "Food handler typhoid & hepatitis immunization",
        "Dermatological evaluation for wet-work eczema"
      ],
      guidance: "Wear anti-fatigue compression socks. Use non-slip rubber soled kitchen shoes."
    },
    Domestic: {
      risks: [
        "Bleach and caustic cleaner aerosol inhalation",
        "Repetitive knee flexion while scrubbing",
        "Ergonomic strain from manual clothes wringing"
      ],
      screenings: [
        "Skin patch testing for cleaning chemical allergies",
        "Bilateral knee osteoarthritic screening",
        "Respiratory allergen evaluation"
      ],
      guidance: "Never mix ammonia and chlorine bleach. Use knee cushions when kneeling to clean floors."
    }
  };

  const currentData = hazardMap[selectedIndustry] || hazardMap["Construction"];

  const handleToggleCheck = (item: string) => {
    setChecklist({ ...checklist, [item]: !checklist[item] });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.occupationalScreening}</h2>
            <p className="text-xs text-slate-500">
              Industry-specific workplace health hazard screening and preventive protective protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Industry Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {industries.map((ind) => {
          const Icon = ind.icon;
          const isSelected = selectedIndustry === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(ind.id)}
              className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${ind.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                {ind.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            {selectedIndustry} Exposure Hazards & Clinical Screenings
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Non-Diagnostic Preventive Screening
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exposure Hazards */}
          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Primary Workplace Hazards
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-950">
              {currentData.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Screenings Checklist */}
          <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-200/70">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Recommended Medical Screenings
            </h4>
            <div className="space-y-2">
              {currentData.screenings.map((s, i) => (
                <label key={i} className="flex items-center gap-2.5 text-xs text-teal-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checklist[`${selectedIndustry}_${i}`]}
                    onChange={() => handleToggleCheck(`${selectedIndustry}_${i}`)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className={checklist[`${selectedIndustry}_${i}`] ? 'line-through text-teal-600' : ''}>
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Preventive Guidance */}
        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200/70 text-xs text-blue-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block mb-0.5 text-blue-950">Worker Safety Advice:</strong>
            {currentData.guidance}
          </div>
        </div>
      </div>
    </div>
  );
};
