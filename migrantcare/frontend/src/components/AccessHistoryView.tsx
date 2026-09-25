import React, { useEffect, useState } from 'react';
import { ShieldAlert, UserCheck, Clock, Ban, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import { LanguageCode, translations } from '../locales/translations';

interface AccessHistoryViewProps {
  language: LanguageCode;
}

export const AccessHistoryView: React.FC<AccessHistoryViewProps> = ({ language }) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeGrants, setActiveGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const t = translations[language];

  const loadData = async () => {
    try {
      setLoading(true);
      const [logs, grants] = await Promise.all([
        ApiService.getAuditLogs(),
        ApiService.getActiveGrants()
      ]);
      setAuditLogs(logs);
      setActiveGrants(grants);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (requestId: number) => {
    try {
      setRevokingId(requestId);
      await ApiService.revokeConsent(requestId);
      setMessage("Doctor access has been immediately revoked.");
      await loadData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Who Viewed My Health Information?</h2>
            <p className="text-xs text-slate-500">
              Complete, tamper-resistant transparency log of every clinician access and authorization event.
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {message}
          </div>
        )}
      </div>

      {/* Currently Active Doctor Grants (with instant Revoke Killswitch) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-600" />
          Currently Authorized Clinicians ({activeGrants.length})
        </h3>

        {activeGrants.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No active doctor permissions. Your records are completely private.
          </div>
        ) : (
          <div className="space-y-3">
            {activeGrants.map((grant) => (
              <div
                key={grant.id}
                className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{grant.doctor_name}</span>
                    <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{grant.hospital_name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Expires: {new Date(grant.expires_at).toLocaleString()} ({grant.duration_hours}h grant)
                  </p>
                </div>

                <button
                  onClick={() => handleRevoke(grant.id)}
                  disabled={revokingId === grant.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-500/20 transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Ban className="w-4 h-4" />
                  {revokingId === grant.id ? "Revoking..." : t.revokeAccess}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Audit Trail */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          Full Access & Security Trail
        </h3>

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No access events recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actor_name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {log.hospital_name && (
                    <p className="text-slate-500 text-[11px] mt-0.5">{log.hospital_name}</p>
                  )}
                  {log.details && (
                    <p className="text-slate-700 text-xs mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {log.details}
                    </p>
                  )}
                </div>
                <div className="text-right text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <div className="text-[10px]">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
