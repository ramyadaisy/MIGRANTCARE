import React, { useState, useEffect } from 'react';
import { 
  Shield, QrCode, FileText, Pill, AlertTriangle, 
  Activity, HardHat, Building2, Bot, History, User, LogIn, Lock 
} from 'lucide-react';
import { ApiService, AuthUser } from './services/api';
import { LanguageCode, translations } from './locales/translations';
import { Navbar } from './components/Navbar';
import { WorkerDashboard } from './components/WorkerDashboard';
import { QRHealthPassportCard } from './components/QRHealthPassportCard';
import { ConsentModal } from './components/ConsentModal';
import { AccessHistoryView } from './components/AccessHistoryView';
import { PrescriptionVault } from './components/PrescriptionVault';
import { MedicalTimelineView } from './components/MedicalTimelineView';
import { AIDocumentScanner } from './components/AIDocumentScanner';
import { OfflineEmergencyCard } from './components/OfflineEmergencyCard';
import { OccupationalHealthView } from './components/OccupationalHealthView';
import { HealthTrendsView } from './components/HealthTrendsView';
import { DoctorPortal } from './components/DoctorPortal';
import { HospitalPortal } from './components/HospitalPortal';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { AIAssistantChat } from './components/AIAssistantChat';
import { FacilityFinder } from './components/FacilityFinder';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [activePendingConsent, setActivePendingConsent] = useState<any | null>(null);
  
  // Login form state
  const [emailOrPhone, setEmailOrPhone] = useState('arun@migrantcare.org');
  const [password, setPassword] = useState('Password123!');
  const [loggingIn, setLoggingIn] = useState(false);

  // Worker profile cache for QR modal
  const [workerData, setWorkerData] = useState<any>(null);

  // Initialize from storage or default to Arun Kumar demo
  useEffect(() => {
    const saved = ApiService.getSavedUser();
    if (saved) {
      setCurrentUser(saved);
      if (saved.role === 'doctor') setActiveTab('doctor');
      else if (saved.role === 'hospital') setActiveTab('hospital');
      else if (saved.role === 'admin') setActiveTab('admin');
      else setActiveTab('home');
    } else {
      // Auto login as worker for instantaneous hackathon demonstration
      handleQuickLogin('arun@migrantcare.org', 'Password123!');
    }
  }, []);

  const handleQuickLogin = async (usr: string, pwd: string) => {
    setLoggingIn(true);
    try {
      const user = await ApiService.login(usr, pwd);
      setCurrentUser(user);
      if (user.role === 'worker') {
        const prof = await ApiService.getWorkerProfile();
        setWorkerData(prof);
        setActiveTab('home');
      } else if (user.role === 'doctor') {
        setActiveTab('doctor');
      } else if (user.role === 'hospital') {
        setActiveTab('hospital');
      } else if (user.role === 'admin') {
        setActiveTab('admin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleQuickRoleSwitch = (role: 'worker' | 'doctor' | 'hospital' | 'admin') => {
    if (role === 'worker') handleQuickLogin('arun@migrantcare.org', 'Password123!');
    else if (role === 'doctor') handleQuickLogin('dr.rajesh@migrantcare.org', 'Password123!');
    else if (role === 'hospital') handleQuickLogin('hospital@migrantcare.org', 'Password123!');
    else if (role === 'admin') handleQuickLogin('admin@migrantcare.org', 'Password123!');
  };

  const handleLogout = () => {
    ApiService.clearAuth();
    setCurrentUser(null);
  };

  const handleApproveConsent = async (requestId: number, scopes: string[], durationHours: number) => {
    await ApiService.approveConsent(requestId, scopes, durationHours);
    setActivePendingConsent(null);
  };

  const handleDeclineConsent = (requestId: number) => {
    setActivePendingConsent(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-center text-slate-900">MIGRANTCARE</h1>
          <p className="text-xs text-center text-slate-500 mt-1">A Portable Digital Health Passport for Migrant Workers</p>

          <form onSubmit={(e) => { e.preventDefault(); handleQuickLogin(emailOrPhone, password); }} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email / Phone</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-300 bg-slate-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              {loggingIn ? "Signing in..." : "Sign In to Health Portal"}
            </button>
          </form>

          {/* Quick Demo Pre-seed Logins */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Instant Hackathon Demo Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('arun@migrantcare.org', 'Password123!')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-blue-900 font-semibold text-center border border-slate-200"
              >
                Worker Arun
              </button>
              <button
                onClick={() => handleQuickLogin('dr.rajesh@migrantcare.org', 'Password123!')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-teal-50 text-teal-900 font-semibold text-center border border-slate-200"
              >
                Dr. Rajesh
              </button>
              <button
                onClick={() => handleQuickLogin('hospital@migrantcare.org', 'Password123!')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-900 font-semibold text-center border border-slate-200"
              >
                Hospital
              </button>
              <button
                onClick={() => handleQuickLogin('admin@migrantcare.org', 'Password123!')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-purple-50 text-purple-900 font-semibold text-center border border-slate-200"
              >
                Public Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        language={language}
        onLanguageChange={setLanguage}
        onQuickRoleSwitch={handleQuickRoleSwitch}
        onNavigateTab={(tab) => { setActiveTab(tab); }}
        activeTab={activeTab}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs Bar for Worker */}
        {currentUser.role === 'worker' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-slate-200">
            {[
              { id: 'home', label: 'Overview', icon: Shield },
              { id: 'records', label: 'Timeline', icon: FileText },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
              { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
              { id: 'ocr', label: 'AI Scanner', icon: QrCode },
              { id: 'occupational', label: 'Occupational', icon: HardHat },
              { id: 'trends', label: 'Health Trends', icon: Activity },
              { id: 'facilities', label: 'Find Clinics', icon: Building2 },
              { id: 'ai', label: 'AI Assistant', icon: Bot },
              { id: 'history', label: 'Access History', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Routing */}
        {activeTab === 'home' && currentUser.role === 'worker' && (
          <WorkerDashboard
            language={language}
            onNavigateTab={setActiveTab}
            onOpenPassport={() => setShowPassportModal(true)}
            onOpenPendingConsent={(req) => setActivePendingConsent(req)}
          />
        )}

        {activeTab === 'records' && <MedicalTimelineView language={language} />}
        {activeTab === 'prescriptions' && <PrescriptionVault language={language} />}
        {activeTab === 'emergency' && <OfflineEmergencyCard language={language} />}
        {activeTab === 'ocr' && <AIDocumentScanner language={language} />}
        {activeTab === 'occupational' && <OccupationalHealthView language={language} />}
        {activeTab === 'trends' && <HealthTrendsView language={language} />}
        {activeTab === 'facilities' && <FacilityFinder language={language} />}
        {activeTab === 'ai' && <AIAssistantChat language={language} />}
        {activeTab === 'history' && <AccessHistoryView language={language} />}
        
        {/* Clinician / Hospital / Admin Views */}
        {activeTab === 'doctor' && <DoctorPortal language={language} />}
        {activeTab === 'hospital' && <HospitalPortal language={language} />}
        {activeTab === 'admin' && <AdminAnalyticsView language={language} />}
      </main>

      {/* QR Passport Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full">
            <QRHealthPassportCard
              worker={workerData || {
                health_id: currentUser.health_id || "MC-2026-001245",
                full_name: currentUser.full_name,
                blood_group: "O+",
                phone: "+91 98412 34567",
                home_state: "Tamil Nadu",
                current_city: "Bengaluru",
                current_state: "Karnataka",
                emergency_profile: {
                  critical_allergies: "Severe Penicillin Allergy, Sulfa Drugs",
                  emergency_contact_name: "Murugan (Brother)",
                  emergency_contact_phone: "+91 98765 43210"
                }
              }}
              language={language}
              onClose={() => setShowPassportModal(false)}
            />
          </div>
        </div>
      )}

      {/* Consent Modal Trigger */}
      {activePendingConsent && (
        <ConsentModal
          request={activePendingConsent}
          language={language}
          onApprove={handleApproveConsent}
          onDecline={handleDeclineConsent}
          onClose={() => setActivePendingConsent(null)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>MigrantCare</strong> — Portable Digital Health Passport for Migrant Workers
          </span>
          <span className="text-[11px] text-slate-400">
            Health records that travel with the worker • Cross-State Care Continuity
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
