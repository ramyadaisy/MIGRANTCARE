import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface FacilityFinderProps {
  language: LanguageCode;
}

export const FacilityFinder: React.FC<FacilityFinderProps> = ({ language }) => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [city, setCity] = useState("All");
  const [facilityType, setFacilityType] = useState("All");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [freeOpdOnly, setFreeOpdOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFacilities(city, facilityType, emergencyOnly, freeOpdOnly);
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [city, facilityType, emergencyOnly, freeOpdOnly]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.actionFacilities}</h2>
            <p className="text-xs text-slate-500">
              Locate public hospitals, ESI dispensaries, and Jan Aushadhi generic medicine centers without privacy-invading GPS tracking.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
            >
              <option value="All">All Cities</option>
              <option value="Bengaluru">Bengaluru (Karnataka)</option>
              <option value="Tiruchirappalli">Tiruchirappalli (Tamil Nadu)</option>
              <option value="Chennai">Chennai (Tamil Nadu)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Facility Type
            </label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-slate-50"
            >
              <option value="All">All Facility Types</option>
              <option value="Government Hospital">Government Hospitals</option>
              <option value="ESI Clinic">ESI Dispensaries</option>
              <option value="Jan Aushadhi">Jan Aushadhi Generic Pharmacies</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={freeOpdOnly}
                onChange={(e) => setFreeOpdOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              Free OPD Only
            </label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
              24/7 Trauma / Emergency
            </label>
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {f.facility_type}
                </span>
                <div className="flex items-center gap-1.5">
                  {f.has_free_opd && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Free OPD
                    </span>
                  )}
                  {f.emergency_available && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      24/7 ER
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2.5">{f.name}</h3>

              <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{f.address}, {f.city}, {f.state}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {f.phone}
              </span>
              <a
                href={`tel:${f.phone.replace(/[^0-9+]/g, '')}`}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
              >
                Call Clinic
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
