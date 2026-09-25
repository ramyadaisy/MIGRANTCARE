from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str
    health_id: Optional[str] = None
    doctor_code: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    email_or_phone: str
    password: str

class UserCreate(BaseModel):
    email_or_phone: str
    password: str
    role: str = "worker" # worker, doctor, hospital, admin
    full_name: str
    phone: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = "O+"
    home_state: Optional[str] = None
    home_district: Optional[str] = None
    current_state: Optional[str] = None
    current_city: Optional[str] = None
    preferred_language: Optional[str] = "en"
    
    # Emergency & Clinical Details
    critical_allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    organ_donor: Optional[bool] = False
    special_instructions: Optional[str] = None
    
    # Occupational Details
    primary_industry: Optional[str] = None
    current_workplace: Optional[str] = None
    years_in_field: Optional[int] = 1
    
    # Clinician / Facility Details
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    registration_number: Optional[str] = None
    facility_type: Optional[str] = None
    license_number: Optional[str] = None

# Worker & Emergency Profile Schemas
class EmergencyProfileSchema(BaseModel):
    critical_allergies: str
    chronic_conditions: str
    blood_group: str
    emergency_contact_name: str
    emergency_contact_relation: str
    emergency_contact_phone: str
    organ_donor: bool
    special_instructions: Optional[str] = None

    model_config = {"from_attributes": True}

class WorkerProfileResponse(BaseModel):
    id: int
    health_id: str
    full_name: str
    blood_group: str
    phone: str
    date_of_birth: Optional[str]
    gender: Optional[str]
    home_state: str
    current_state: str
    current_city: str
    preferred_language: str
    emergency_profile: Optional[EmergencyProfileSchema]

    model_config = {"from_attributes": True}

# Medication & Prescription Schemas
class MedicationCreate(BaseModel):
    drug_name: str
    dosage: str
    frequency: str
    timing: str = "After Food"
    duration_days: int = 5
    instructions: Optional[str] = None

class MedicationResponse(BaseModel):
    id: int
    drug_name: str
    dosage: str
    frequency: str
    timing: str
    duration_days: int
    instructions: Optional[str]

    model_config = {"from_attributes": True}

class PrescriptionCreate(BaseModel):
    worker_health_id: str
    diagnosis: str
    notes: Optional[str] = None
    valid_until: Optional[str] = None
    medications: List[MedicationCreate]

class PrescriptionResponse(BaseModel):
    id: int
    diagnosis: str
    notes: Optional[str]
    valid_until: Optional[str]
    created_at: datetime
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    medications: List[MedicationResponse] = []

    model_config = {"from_attributes": True}

# Medical Record & Timeline
class MedicalRecordCreate(BaseModel):
    worker_health_id: str
    record_type: str = "Consultation"
    diagnosis: str
    symptoms: Optional[str] = None
    treatment_notes: Optional[str] = None
    recorded_date: str

class MedicalRecordResponse(BaseModel):
    id: int
    record_type: str
    diagnosis: str
    symptoms: Optional[str]
    treatment_notes: Optional[str]
    recorded_date: str
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None

    model_config = {"from_attributes": True}

# Consent Schemas
class ConsentCreateRequest(BaseModel):
    worker_health_id: str
    requested_scopes: List[str] = ["medical_history", "prescriptions", "lab_reports"]
    duration_hours: int = 24

class ConsentApprovalRequest(BaseModel):
    request_id: int
    approved_scopes: List[str]
    duration_hours: int = 24

class ConsentRevokeRequest(BaseModel):
    request_id: int

class ConsentResponse(BaseModel):
    id: int
    worker_id: int
    doctor_id: int
    doctor_name: str
    hospital_name: str
    status: str
    requested_scopes: List[str]
    duration_hours: int
    granted_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

# OCR Extracted Entity Schemas
class ExtractedEntitySchema(BaseModel):
    id: Optional[int] = None
    field_name: str
    field_value: str
    confidence_score: float
    is_verified_by_user: bool = False

class DocumentEntityVerifyRequest(BaseModel):
    document_id: int
    verified_entities: List[ExtractedEntitySchema]

class DocumentUploadResponse(BaseModel):
    document_id: int
    document_title: str
    document_type: str
    ocr_status: str
    raw_ocr_text: Optional[str]
    extracted_entities: List[ExtractedEntitySchema]

# Health Screening & Trends
class HealthScreeningCreate(BaseModel):
    systolic_bp: int
    diastolic_bp: int
    pulse_rate: int
    blood_glucose: int
    weight_kg: float
    height_cm: float
    respiratory_symptom_flag: bool = False
    musculoskeletal_flag: bool = False
    hearing_screen_flag: bool = False

class HealthScreeningResponse(BaseModel):
    id: int
    screening_date: str
    systolic_bp: int
    diastolic_bp: int
    pulse_rate: int
    blood_glucose: int
    weight_kg: float
    height_cm: float
    bmi: float
    respiratory_symptom_flag: bool
    musculoskeletal_flag: bool
    hearing_screen_flag: bool

    model_config = {"from_attributes": True}

# AI Assistant Query
class AIAssistantRequest(BaseModel):
    query: str
    language: str = "en" # en, ta, hi, te, kn, ml, bn

class AIAssistantResponse(BaseModel):
    reply: str
    explanation: Optional[str] = None
    safety_disclaimer: str = "This educational explanation is generated by MigrantCare AI to help you understand your health information. It does NOT constitute medical diagnosis or prescription. In case of severe chest pain, breathing difficulty, or trauma, contact emergency services immediately."
    suggested_questions_for_doctor: List[str] = []
