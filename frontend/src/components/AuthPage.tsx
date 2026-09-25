import React, { useState } from 'react';
import { 
  Shield, Stethoscope, Building2, Landmark, Lock, Mail, Phone, 
  User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { ApiService, AuthUser } from '../services/api';

interface AuthPageProps {
  onSuccess: (user: AuthUser) => void;
}

type UserRole = 'worker' | 'doctor' | 'hospital' | 'admin';

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign In inputs
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Worker Registration inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [homeState, setHomeState] = useState('Tamil Nadu');
  const [currentCity, setCurrentCity] = useState('Bengaluru');
  const [currentState, setCurrentState] = useState('Karnataka');
  const [preferredLanguage, setPreferredLanguage] = useState('ta');
  const [occupation, setOccupation] = useState('Construction');

  // Clinician / Facility Registration inputs
  const [specialization, setSpecialization] = useState('General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!signInIdentifier.trim() || !signInPassword.trim()) {
      setErrorMessage("Please enter your registered email/phone and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await ApiService.login(signInIdentifier.trim(), signInPassword);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your phone/email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !regPassword.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email_or_phone: phone.trim(),
        password: regPassword,
        role: selectedRole,
        full_name: fullName.trim(),
        phone: phone.trim(),
        home_state: homeState,
        current_city: currentCity,
        current_state: currentState,
        blood_group: bloodGroup,
        preferred_language: preferredLanguage
      };

      if (selectedRole === 'doctor') {
        payload.specialization = specialization;
        payload.registration_number = registrationNumber || `REG-${Date.now().toString().slice(-5)}`;
        payload.hospital_name = hospitalName || "General Hospital";
      } else if (selectedRole === 'hospital') {
        payload.hospital_name = hospitalName || fullName;
      }

      const user = await ApiService.register(payload);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. A user with this phone or email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = [
    {
      role: 'worker' as UserRole,
      label: 'Migrant Worker',
      desc: 'Digital Health Passport & Emergency Card',
      icon: User,
      color: 'border-blue-500 bg-blue-50/40 text-blue-900'
    },
    {
      role: 'doctor' as UserRole,
      label: 'Doctor / OPD Clinician',
      desc: 'Authorized Clinical Review & e-Prescriptions',
      icon: Stethoscope,
      color: 'border-teal-500 bg-teal-50/40 text-teal-900'
    },
    {
      role: 'hospital' as UserRole,
      label: 'Hospital Facility Desk',
      desc: 'OPD Scheduling & Facility Management',
      icon: Building2,
      color: 'border-indigo-500 bg-indigo-50/40 text-indigo-900'
    },
    {
      role: 'admin' as UserRole,
      label: 'Health Authority',
      desc: 'Public Health Surveillance & Corridors',
      icon: Landmark,
      color: 'border-purple-500 bg-purple-50/40 text-purple-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Enterprise Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 shadow-xl shadow-blue-500/20 mb-3">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          MIGRANTCARE
        </h1>
        <p className="text-sm font-medium text-slate-300 mt-1 max-w-lg mx-auto">
          National Portable Digital Health Passport System for Mobile & Migrant Populations
        </p>

        {/* Institutional Trust Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Patient-Controlled Consent Protocol
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            256-Bit Cryptographic Data Protection
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Interstate Care Continuity
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                mode === 'signin'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Health Portal
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create New Account / Register
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Select Your Portal Role:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {roleConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedRole === cfg.role;
                  return (
                    <button
                      key={cfg.role}
                      type="button"
                      onClick={() => setSelectedRole(cfg.role)}
                      className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                        isSelected
                          ? `${cfg.color} border-2 shadow-sm ring-1 ring-blue-500/20`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60 shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{cfg.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1">{cfg.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number or Email Address
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="e.g. 9841234567 or user@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your confidential password"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600" />
                    Remember credentials
                  </label>
                  <span className="text-slate-400 text-[11px]">
                    24/7 Helpline: 108 / 112
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  {loading ? "Authenticating..." : `Sign In as ${selectedRole.toUpperCase()}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* 2. REGISTRATION FORM (Pure user input, no forced demo data) */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'doctor' ? 'e.g. Dr. Ramesh Gupta' : 'e.g. Senthil Nathan'}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number / Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 12345"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Confidential Password *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Worker Specific Inputs */}
                {selectedRole === 'worker' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group *</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                        >
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Native / Home State *</label>
                        <input
                          type="text"
                          value={homeState}
                          onChange={(e) => setHomeState(e.target.value)}
                          placeholder="e.g. Tamil Nadu, Bihar"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                        <select
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                        >
                          <option value="en">English</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="te">తెలుగు (Telugu)</option>
                          <option value="kn">ಕನ್ನಡ (Kannada)</option>
                          <option value="ml">മലയാളം (Malayalam)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Current Workplace City *</label>
                        <input
                          type="text"
                          value={currentCity}
                          onChange={(e) => setCurrentCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Chennai, Mumbai"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Destination State *</label>
                        <input
                          type="text"
                          value={currentState}
                          onChange={(e) => setCurrentState(e.target.value)}
                          placeholder="e.g. Karnataka, Maharashtra"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Doctor Specific Inputs */}
                {selectedRole === 'doctor' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medical Registration No.</label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. KMC-10492"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Internal Medicine, Pulmonology"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. Victoria Government Hospital"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Registering Account..." : "Create Account & Generate Official Health ID"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Secure Institutional Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
            <span>Official Healthcare Technology Architecture • Compliant with NDHM Privacy Principles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
