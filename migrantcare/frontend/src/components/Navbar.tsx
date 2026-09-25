import React, { useState } from 'react';
import { 
  Shield, Globe, Mic, MicOff, AlertTriangle, 
  User, Stethoscope, Building2, BarChart3, LogOut, CheckCircle2 
} from 'lucide-react';
import { LanguageCode, translations } from '../locales/translations';
import { AuthUser } from '../services/api';
import { VoiceAssistant } from '../services/voice';

interface NavbarProps {
  currentUser: AuthUser;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onQuickRoleSwitch: (role: 'worker' | 'doctor' | 'hospital' | 'admin') => void;
  onNavigateTab: (tab: string) => void;
  activeTab: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  language,
  onLanguageChange,
  onQuickRoleSwitch,
  onNavigateTab,
  activeTab,
  onLogout
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const t = translations[language];

  const handleToggleVoice = () => {
    if (isListening) {
      VoiceAssistant.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      VoiceAssistant.listen(
        language,
        (command, targetTab) => {
          setIsListening(false);
          setVoiceTranscript(command);
          if (targetTab) {
            onNavigateTab(targetTab);
            VoiceAssistant.speak(`Navigating to ${targetTab}`, language);
          } else {
            VoiceAssistant.speak(`Command heard: ${command}`, language);
          }
          setTimeout(() => setVoiceTranscript(null), 4000);
        },
        (error) => {
          setIsListening(false);
          console.error(error);
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro-bar: Hackathon & Demo Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-600 to-indigo-700 px-4 py-1 text-xs font-medium text-center flex items-center justify-between text-white/95">
        <span className="flex items-center gap-1.5 mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
          <span>{t.demoModeNotice}</span>
        </span>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-blue-100">
          <span>Quick Switch:</span>
          <button 
            onClick={() => onQuickRoleSwitch('worker')}
            className={`px-1.5 py-0.5 rounded transition ${currentUser.role === 'worker' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/20'}`}
          >
            Worker Arun
          </button>
          <span>|</span>
          <button 
            onClick={() => onQuickRoleSwitch('doctor')}
            className={`px-1.5 py-0.5 rounded transition ${currentUser.role === 'doctor' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/20'}`}
          >
            Dr. Rajesh
          </button>
          <span>|</span>
          <button 
            onClick={() => onQuickRoleSwitch('hospital')}
            className={`px-1.5 py-0.5 rounded transition ${currentUser.role === 'hospital' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/20'}`}
          >
            Hospital
          </button>
          <span>|</span>
          <button 
            onClick={() => onQuickRoleSwitch('admin')}
            className={`px-1.5 py-0.5 rounded transition ${currentUser.role === 'admin' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/20'}`}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateTab(currentUser.role === 'worker' ? 'home' : currentUser.role)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Health Passport
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs md:max-w-md">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voice Assistant Mic */}
          <div className="relative">
            <button
              onClick={handleToggleVoice}
              title={isListening ? "Listening... click to stop" : "Click to speak voice command"}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isListening 
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-teal-400" />}
              <span className="hidden md:inline">{isListening ? 'Listening...' : 'Voice Assist'}</span>
            </button>
            {voiceTranscript && (
              <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded shadow-xl text-teal-300 whitespace-nowrap z-50">
                "{voiceTranscript}"
              </div>
            )}
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="ta" className="bg-slate-800 text-white">தமிழ் (Tamil)</option>
              <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
              <option value="te" className="bg-slate-800 text-white">తెలుగు (Telugu)</option>
              <option value="kn" className="bg-slate-800 text-white">ಕನ್ನಡ (Kannada)</option>
              <option value="ml" className="bg-slate-800 text-white">മലയാളം (Malayalam)</option>
              <option value="bn" className="bg-slate-800 text-white">বাংলা (Bengali)</option>
            </select>
          </div>

          {/* Emergency Card Shortcut */}
          <button
            onClick={() => onNavigateTab('emergency')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'emergency'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Emergency</span>
          </button>

          {/* User profile badge & logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-teal-400 capitalize">
                {currentUser.role} {currentUser.health_id ? `• ${currentUser.health_id}` : ''}
              </div>
            </div>
            <button
              onClick={onLogout}
              title={t.logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
