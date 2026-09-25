const API_BASE = '/api';

export interface AuthUser {
  token: string;
  user_id: number;
  role: 'worker' | 'doctor' | 'hospital' | 'admin';
  full_name: string;
  health_id?: string;
  doctor_code?: string;
}

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('migrantcare_token');
  }

  public static setAuth(auth: AuthUser) {
    localStorage.setItem('migrantcare_token', auth.token);
    localStorage.setItem('migrantcare_user', JSON.stringify(auth));
  }

  public static getSavedUser(): AuthUser | null {
    const raw = localStorage.getItem('migrantcare_user');
    return raw ? JSON.parse(raw) : null;
  }

  public static clearAuth() {
    localStorage.removeItem('migrantcare_token');
    localStorage.removeItem('migrantcare_user');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `API Error: ${res.status}`;
      try {
        const json = await res.json();
        errorMsg = json.detail || json.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth
  public static async login(email_or_phone: string, password: string): Promise<AuthUser> {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone, password })
    });
    const authUser: AuthUser = {
      token: data.access_token,
      user_id: data.user_id,
      role: data.role,
      full_name: data.full_name,
      health_id: data.health_id,
      doctor_code: data.doctor_code
    };
    this.setAuth(authUser);
    return authUser;
  }

  public static async register(userData: any): Promise<AuthUser> {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    const authUser: AuthUser = {
      token: data.access_token,
      user_id: data.user_id,
      role: data.role,
      full_name: data.full_name,
      health_id: data.health_id,
      doctor_code: data.doctor_code
    };
    this.setAuth(authUser);
    return authUser;
  }

  // Worker endpoints
  public static async getWorkerProfile() {
    const data = await this.request<any>('/worker/profile');
    // Cache for offline emergency use
    if (data.emergency_profile) {
      localStorage.setItem('migrantcare_offline_emergency', JSON.stringify({
        health_id: data.health_id,
        full_name: data.full_name,
        blood_group: data.blood_group,
        ...data.emergency_profile
      }));
    }
    return data;
  }

  public static getOfflineEmergencyProfile() {
    const raw = localStorage.getItem('migrantcare_offline_emergency');
    if (raw) return JSON.parse(raw);
    return {
      health_id: "MC-2026-001245",
      full_name: "Arun Kumar",
      blood_group: "O+",
      critical_allergies: "Severe Penicillin Allergy, Sulfa Drugs",
      chronic_conditions: "Mild Dust-Induced Occupational Asthma",
      emergency_contact_name: "Murugan (Brother)",
      emergency_contact_phone: "+91 98765 43210",
      special_instructions: "Carry Salbutamol rescue inhaler. Do NOT administer penicillin."
    };
  }

  public static async updateLanguage(language: string) {
    return this.request('/worker/profile/language', {
      method: 'PUT',
      body: JSON.stringify({ language })
    });
  }

  public static async updateMigration(city: string, state: string) {
    return this.request('/worker/profile/migration', {
      method: 'PUT',
      body: JSON.stringify({ current_city: city, current_state: state })
    });
  }

  public static async getTimeline() {
    return this.request<any[]>('/records/my-timeline');
  }

  public static async addMedicalRecord(data: any) {
    return this.request<any>('/records/my-records', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getPrescriptions() {
    return this.request<any[]>('/records/my-prescriptions');
  }

  public static async addPrescription(data: any) {
    return this.request<any>('/records/my-prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async updateEmergencyProfile(data: any) {
    return this.request<any>('/worker/emergency-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async addVaccination(data: any) {
    return this.request<any>('/worker/vaccinations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async getVaccinations() {
    return this.request<any[]>('/worker/vaccinations');
  }

  public static async getScreenings() {
    return this.request<any[]>('/worker/screenings');
  }

  public static async addScreening(screeningData: any) {
    return this.request('/worker/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData)
    });
  }

  public static async getReminders() {
    return this.request<any[]>('/worker/reminders');
  }

  public static async getNotifications() {
    return this.request<any[]>('/worker/notifications');
  }

  public static async getAuditLogs() {
    return this.request<any[]>('/worker/audit-logs');
  }

  // Consent
  public static async getPendingConsents() {
    return this.request<any[]>('/consent/pending');
  }

  public static async getActiveGrants() {
    return this.request<any[]>('/consent/active-grants');
  }

  public static async approveConsent(requestId: number, scopes: string[], durationHours: number = 24) {
    return this.request('/consent/approve', {
      method: 'POST',
      body: JSON.stringify({
        request_id: requestId,
        approved_scopes: scopes,
        duration_hours: durationHours
      })
    });
  }

  public static async revokeConsent(requestId: number) {
    return this.request('/consent/revoke', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId })
    });
  }

  // Doctor services
  public static async doctorSearchWorker(healthId: string) {
    return this.request<any>(`/doctor/search-worker/${encodeURIComponent(healthId)}`);
  }

  public static async doctorRequestConsent(workerHealthId: string, scopes: string[], durationHours: number = 24) {
    return this.request<any>('/consent/request', {
      method: 'POST',
      body: JSON.stringify({
        worker_health_id: workerHealthId,
        requested_scopes: scopes,
        duration_hours: durationHours
      })
    });
  }

  public static async doctorViewRecords(healthId: string) {
    return this.request<any>(`/records/doctor-view/${encodeURIComponent(healthId)}`);
  }

  public static async doctorAddConsultation(consultationData: any) {
    return this.request<any>('/records/doctor-consultation', {
      method: 'POST',
      body: JSON.stringify(consultationData)
    });
  }

  public static async getDoctorDashboard() {
    return this.request<any>('/doctor/dashboard-stats');
  }

  // Documents & OCR
  public static async uploadDocument(formData: FormData) {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/records/upload-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) throw new Error("Document upload failed");
    return res.json();
  }

  public static async verifyEntities(documentId: number, verifiedEntities: any[]) {
    return this.request('/records/verify-entities', {
      method: 'POST',
      body: JSON.stringify({
        document_id: documentId,
        verified_entities: verifiedEntities
      })
    });
  }

  // Facilities
  public static async getFacilities(city?: string, type?: string, emergency?: boolean, freeOpd?: boolean) {
    const params = new URLSearchParams();
    if (city && city !== 'All') params.append('city', city);
    if (type && type !== 'All') params.append('facility_type', type);
    if (emergency) params.append('emergency_only', 'true');
    if (freeOpd) params.append('free_opd_only', 'true');
    return this.request<any[]>(`/facilities/?${params.toString()}`);
  }

  // Analytics
  public static async getAnalytics() {
    return this.request<any>('/analytics/summary');
  }

  // AI Assistant
  public static async queryAI(query: string, language: string = 'en') {
    return this.request<any>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query, language })
    });
  }
}
