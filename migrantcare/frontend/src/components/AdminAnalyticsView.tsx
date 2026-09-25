import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Stethoscope, Building, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface AdminAnalyticsViewProps {
  language: LanguageCode;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ language }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    ApiService.getAnalytics().then(setAnalytics).finally(() => setLoading(false));
  }, []);

  if (!analytics) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.adminAnalytics}</h2>
            <p className="text-xs text-slate-500">
              Aggregated, anonymized public health surveillance and interstate migration metrics.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Strict Non-PII Aggregation
        </span>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Migrant Workers</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{analytics.metrics.registered_workers.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% monthly growth
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Clinicians</span>
          <div className="text-2xl font-black text-teal-600 mt-1">{analytics.metrics.verified_doctors.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Government & Trust OPDs</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Care Continuity Rate</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{analytics.metrics.continuity_rate}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Across 12 states</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prevented Duplicate Tests</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{analytics.metrics.prevented_duplicate_tests}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Saved worker out-of-pocket costs</span>
        </div>
      </div>

      {/* Migration Corridors & Occupational Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Migration Corridors */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            High-Volume Interstate Health Corridors
          </h3>
          <div className="space-y-3">
            {analytics.migration_corridors.map((c: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span>{c.origin}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{c.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{c.count} workers</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {c.flow} Flow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupational Categories */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Occupational Labor Categories
          </h3>
          <div className="space-y-3">
            {analytics.occupations.map((o: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{o.industry}</span>
                  <span>{o.percentage}% ({o.workers.toLocaleString()} workers)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${o.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occupational Health Risk Surveillance */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Public Health Risk Prevalence in Migrant Screenings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {analytics.health_risk_distribution.map((h: any, i: number) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{h.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  h.status === 'High' ? 'bg-rose-100 text-rose-800' :
                  h.status === 'Action Needed' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {h.status}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{h.rate_percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
