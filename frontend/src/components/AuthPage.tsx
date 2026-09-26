import React, { useState } from 'react';
import { 
  Shield, Stethoscope, Building2, Landmark, Lock, Mail, Phone, 
  User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck,
  Heart, AlertTriangle, MapPin, Briefcase, Calendar, Info
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign In inputs (start completely blank)
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Manual Worker Registration inputs (All start completely blank for pure manual entry)
  // 1. Personal & Contact
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // 2. Migration Corridor
  const [homeState, setHomeState] = useState('');
  const [homeDistrict, setHomeDistrict] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [currentCity, setCurrentCity] = useState('');

  // 3. Emergency & Clinical
  const [bloodGroup, setBloodGroup] = useState('');
  const [criticalAllergies, setCriticalAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [organDonor, setOrganDonor] = useState(false);

  // 4. Occupational Profile
  const [primaryIndustry, setPrimaryIndustry] = useState('');
  const [currentWorkplace, setCurrentWorkplace] = useState('');
  const [yearsInField, setYearsInField] = useState('1');

  // 5. Credentials
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clinician / Facility Registration inputs
  const [specialization, setSpecialization] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [facilityType, setFacilityType] = useState('Government District Hospital');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!signInIdentifier.trim() || !signInPassword.trim()) {
      setErrorMessage("Please enter your registered mobile number/email and password.");
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

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full legal name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your mobile phone number.");
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both password fields.");
      return;
    }

    if (selectedRole === 'worker') {
      if (!bloodGroup) {
        setErrorMessage("Please select your blood group for emergency preparedness.");
        return;
      }
      if (!homeState.trim() || !currentState.trim() || !currentCity.trim()) {
        setErrorMessage("Please fill in your Home State, Current State, and Workplace City.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        email_or_phone: phone.trim(),
        password: regPassword,
        role: selectedRole,
        full_name: fullName.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        blood_group: bloodGroup || "O+",
        home_state: homeState.trim() || "Not specified",
        home_district: homeDistrict.trim() || undefined,
        current_state: currentState.trim() || "Not specified",
        current_city: currentCity.trim() || "Not specified",
        preferred_language: preferredLanguage,

        // Emergency profile data
        critical_allergies: criticalAllergies.trim() || "None reported",
        chronic_conditions: chronicConditions.trim() || "None reported",
        emergency_contact_name: emergencyContactName.trim() || "Emergency Contact",
        emergency_contact_relation: emergencyContactRelation.trim() || "Family",
        emergency_contact_phone: emergencyContactPhone.trim() || phone.trim(),
        organ_donor: organDonor,
        special_instructions: specialInstructions.trim() || undefined,

        // Occupational profile data
        primary_industry: primaryIndustry.trim() || "General Labor",
        current_workplace: currentWorkplace.trim() || undefined,
        years_in_field: parseInt(yearsInField, 10) || 1
      };

      if (selectedRole === 'doctor') {
        payload.specialization = specialization.trim() || "General Medicine";
        payload.registration_number = registrationNumber.trim() || `REG-${Date.now().toString().slice(-5)}`;
        payload.hospital_name = hospitalName.trim() || "General Hospital";
        payload.current_city = currentCity.trim() || "General";
        payload.current_state = currentState.trim() || "General";
      } else if (selectedRole === 'hospital') {
        payload.hospital_name = hospitalName.trim() || fullName.trim();
        payload.facility_type = facilityType;
        payload.license_number = registrationNumber.trim() || `HOSP-${Date.now().toString().slice(-5)}`;
        payload.current_city = currentCity.trim() || "General";
        payload.current_state = currentState.trim() || "General";
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
      color: 'border-blue-500 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
    },
    {
      role: 'doctor' as UserRole,
      label: 'Doctor / OPD Clinician',
      desc: 'Authorized Clinical Review & e-Prescriptions',
      icon: Stethoscope,
      color: 'border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20'
    },
    {
      role: 'hospital' as UserRole,
      label: 'Hospital Facility Desk',
      desc: 'OPD Scheduling & Facility Management',
      icon: Building2,
      color: 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
    },
    {
      role: 'admin' as UserRole,
      label: 'Health Authority',
      desc: 'Public Health Surveillance & Corridors',
      icon: Landmark,
      color: 'border-purple-500 bg-purple-50/50 text-purple-900 ring-2 ring-purple-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Enterprise Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-6">
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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Patient-Controlled Consent Protocol
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            256-Bit Cryptographic Data Protection
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Interstate Care Continuity
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center justify-center gap-2 ${
                mode === 'signin'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              Sign In to Health Portal
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              Create Account (Manual Entry)
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Role Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Select Your Portal Role:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {roleConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedRole === cfg.role;
                  return (
                    <button
                      key={cfg.role}
                      type="button"
                      onClick={() => { setSelectedRole(cfg.role); setErrorMessage(null); }}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col gap-2 ${
                        isSelected
                          ? `${cfg.color} border-2 shadow-sm`
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-slate-200/80 w-fit">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{cfg.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1">{cfg.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium flex items-start gap-2 animate-fadeIn">
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
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? "Authenticating..." : `Sign In as ${selectedRole.toUpperCase()}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* 2. REGISTRATION FORM (Pure user input, manual entry for all fields) */
              <form onSubmit={handleRegister} className="space-y-6">
                
                {/* 2.1 Basic Identity Section */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Personal Identity & Contact Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Language for Audio & SMS
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="en">English (Default)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                      <option value="ml">മലയാളം (Malayalam)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>

                {/* 2.2 Worker Specific Sections */}
                {selectedRole === 'worker' && (
                  <>
                    {/* Migration Corridor */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Migration Route & Location Details</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Home / Origin State <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={homeState}
                            onChange={(e) => setHomeState(e.target.value)}
                            placeholder="e.g. Bihar, Odisha, Uttar Pradesh, Tamil Nadu"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Home District / Town (Optional)
                          </label>
                          <input
                            type="text"
                            value={homeDistrict}
                            onChange={(e) => setHomeDistrict(e.target.value)}
                            placeholder="e.g. Madhubani, Ganjam, Gorakhpur"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Current Destination State <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={currentState}
                            onChange={(e) => setCurrentState(e.target.value)}
                            placeholder="e.g. Karnataka, Maharashtra, Kerala, Tamil Nadu"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Current Workplace City / Town <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={currentCity}
                            onChange={(e) => setCurrentCity(e.target.value)}
                            placeholder="e.g. Bengaluru, Pune, Ernakulam, Surat"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Emergency & Clinical Profile */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <span>Emergency Medical Profile & Alerts</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Blood Group <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          >
                            <option value="">-- Select Blood Group --</option>
                            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Critical Drug Allergies
                          </label>
                          <input
                            type="text"
                            value={criticalAllergies}
                            onChange={(e) => setCriticalAllergies(e.target.value)}
                            placeholder="e.g. Penicillin, Sulfa or None"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Chronic Health Conditions
                          </label>
                          <input
                            type="text"
                            value={chronicConditions}
                            onChange={(e) => setChronicConditions(e.target.value)}
                            placeholder="e.g. Asthma, Diabetes or None"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            placeholder="e.g. Suresh (Brother)"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Relationship
                          </label>
                          <input
                            type="text"
                            value={emergencyContactRelation}
                            onChange={(e) => setEmergencyContactRelation(e.target.value)}
                            placeholder="e.g. Spouse, Brother, Parent"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Emergency Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            placeholder="e.g. +91 91234 56789"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Special Medical Instructions (Optional)
                          </label>
                          <input
                            type="text"
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            placeholder="e.g. Carries emergency inhaler; reacts to dust"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="pt-4">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={organDonor}
                              onChange={(e) => setOrganDonor(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Pledged Organ Donor</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Occupational Profile */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <span>Occupational Background</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Primary Industry / Trade
                          </label>
                          <select
                            value={primaryIndustry}
                            onChange={(e) => setPrimaryIndustry(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">-- Select Industry --</option>
                            <option value="Construction">Construction & Civil Works</option>
                            <option value="Factory">Factory & Manufacturing</option>
                            <option value="Agriculture">Agriculture & Plantation</option>
                            <option value="Transport">Logistics & Transport</option>
                            <option value="Hospitality">Hospitality & Food Services</option>
                            <option value="Domestic">Domestic & Cleaning Work</option>
                            <option value="Textiles">Textiles & Garments</option>
                            <option value="Mining">Mining & Quarry</option>
                            <option value="General Labor">Other General Labor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Current Workplace / Site Name
                          </label>
                          <input
                            type="text"
                            value={currentWorkplace}
                            onChange={(e) => setCurrentWorkplace(e.target.value)}
                            placeholder="e.g. Metro Rail Site 4, Whitefield"
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Years in Trade
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={yearsInField}
                            onChange={(e) => setYearsInField(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2.3 Doctor Specific Inputs */}
                {selectedRole === 'doctor' && (
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Doctor Clinical Verification Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Medical Registration No.</label>
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="e.g. KMC-10492 or MCI-78901"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. General Medicine, Pulmonology, Orthopedics"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
                        <input
                          type="text"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          placeholder="e.g. Victoria Government Hospital"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Hospital City</label>
                        <input
                          type="text"
                          value={currentCity}
                          onChange={(e) => setCurrentCity(e.target.value)}
                          placeholder="e.g. Bengaluru"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                        <input
                          type="text"
                          value={currentState}
                          onChange={(e) => setCurrentState(e.target.value)}
                          placeholder="e.g. Karnataka"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.4 Hospital Specific Inputs */}
                {selectedRole === 'hospital' && (
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>Healthcare Facility Verification</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Facility / Hospital Name</label>
                        <input
                          type="text"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          placeholder="e.g. Bowring & Lady Curzon Hospital"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Facility Type</label>
                        <select
                          value={facilityType}
                          onChange={(e) => setFacilityType(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="Government District Hospital">Government District Hospital</option>
                          <option value="Community Health Centre (CHC)">Community Health Centre (CHC)</option>
                          <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                          <option value="Tertiary Medical College">Tertiary Medical College</option>
                          <option value="Private Empanelled Clinic">Private Empanelled Clinic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">License / Accreditation No.</label>
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="e.g. HOSP-BLR-2026-09"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">City & State</label>
                        <input
                          type="text"
                          value={currentCity}
                          onChange={(e) => setCurrentCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Karnataka"
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.5 Security & Password Section */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Security Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Create Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? "Registering & Creating Account..." : "Create Account & Generate Official Health ID"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Secure Institutional Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Official Healthcare Technology Architecture</span>
            <span className="text-[11px] text-slate-400">Compliant with NDHM Privacy & Interoperability Standards</span>
          </div>
        </div>
      </div>
    </div>
  );
};
