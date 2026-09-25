import React, { useState, useEffect } from 'react';
import { 
  Shield, QrCode, FileText, Pill, AlertTriangle, 
  Activity, HardHat, Building2, Bot, History 
} from 'lucide-react';
import { ApiService, AuthUser } from './services/api';
import { LanguageCode, translations } from './locales/translations';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
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
  const [workerData, setWorkerData] = useState<any>(null);

  // Restore authenticated session from local storage if available
  useEffect(() => {
    const saved = ApiService.getSavedUser();
    if (saved) {
      handleAuthSuccess(saved);
    }
  }, []);

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'worker') {
      try {
        const prof = await ApiService.getWorkerProfile();
        setWorkerData(prof);
      } catch (e) {}
      setActiveTab('home');
    } else if (user.role === 'doctor') {
      setActiveTab('doctor');
    } else if (user.role === 'hospital') {
      setActiveTab('hospital');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    ApiService.clearAuth();
    setCurrentUser(null);
    setWorkerData(null);
    setActiveTab('home');
  };

  const handleApproveConsent = async (requestId: number, scopes: string[], durationHours: number) => {
    await ApiService.approveConsent(requestId, scopes, durationHours);
    setActivePendingConsent(null);
  };

  const handleDeclineConsent = (requestId: number) => {
    setActivePendingConsent(null);
  };

  // If unauthenticated, display professional enterprise authentication & registration page
  if (!currentUser) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        language={language}
        onLanguageChange={setLanguage}
        onQuickRoleSwitch={() => {}}
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
                health_id: currentUser.health_id || "MC-2026-000000",
                full_name: currentUser.full_name,
                blood_group: "O+",
                phone: "+91 00000 00000",
                home_state: "State",
                current_city: "City",
                current_state: "State",
                emergency_profile: {
                  critical_allergies: "None recorded",
                  emergency_contact_name: "Emergency Contact",
                  emergency_contact_phone: "+91 00000 00000"
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

      {/* Professional Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>MigrantCare</strong> — Portable Digital Health Passport System
          </span>
          <span className="text-[11px] text-slate-400">
            National Health Mission & NDHM Compatible Protocol • Secure Cross-State Care Continuity
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
