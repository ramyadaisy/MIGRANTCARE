from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email_or_phone = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="worker") # worker, doctor, hospital, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    
    # Relationships
    worker_profile = relationship("Worker", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    hospital_profile = relationship("Hospital", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    health_id = Column(String(30), unique=True, index=True, nullable=False) # e.g. MC-2026-001245
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(20), nullable=True) # YYYY-MM-DD
    gender = Column(String(10), nullable=True)
    blood_group = Column(String(10), nullable=False, default="O+")
    phone = Column(String(20), nullable=False)
    home_state = Column(String(50), nullable=False)
    current_state = Column(String(50), nullable=False)
    current_city = Column(String(50), nullable=False)
    preferred_language = Column(String(20), default="ta") # ta, hi, te, kn, ml, bn, en
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", back_populates="worker_profile")
    emergency_profile = relationship("EmergencyProfile", back_populates="worker", uselist=False, cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="worker", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="worker", cascade="all, delete-orphan")
    medical_documents = relationship("MedicalDocument", back_populates="worker", cascade="all, delete-orphan")
    consent_requests = relationship("ConsentRequest", back_populates="worker", cascade="all, delete-orphan")
    audit_logs = relationship("AccessAuditLog", back_populates="worker", cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="worker", cascade="all, delete-orphan")
    occupational_profile = relationship("OccupationalProfile", back_populates="worker", uselist=False, cascade="all, delete-orphan")
    health_screenings = relationship("HealthScreening", back_populates="worker", cascade="all, delete-orphan")
    medication_reminders = relationship("MedicationReminder", back_populates="worker", cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    doctor_code = Column(String(30), unique=True, index=True, nullable=False) # e.g. DOC-9842
    full_name = Column(String(100), nullable=False)
    specialization = Column(String(100), default="General Medicine")
    registration_number = Column(String(50), nullable=False)
    hospital_name = Column(String(150), nullable=False)
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    is_verified = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="doctor_profile")
    consultations = relationship("MedicalRecord", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    consent_requests = relationship("ConsentRequest", back_populates="doctor")

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    hospital_name = Column(String(150), nullable=False)
    facility_type = Column(String(50), default="Government Hospital")
    license_number = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    contact_number = Column(String(20), nullable=False)
    bed_count = Column(Integer, default=150)
    
    user = relationship("User", back_populates="hospital_profile")

class EmergencyProfile(Base):
    __tablename__ = "emergency_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), unique=True, nullable=False)
    critical_allergies = Column(String(255), default="Penicillin, Sulfa drugs")
    chronic_conditions = Column(String(255), default="Mild Occupational Asthma")
    blood_group = Column(String(10), default="O+")
    emergency_contact_name = Column(String(100), default="Murugan (Brother)")
    emergency_contact_relation = Column(String(50), default="Brother")
    emergency_contact_phone = Column(String(20), default="+91 98765 43210")
    organ_donor = Column(Boolean, default=True)
    special_instructions = Column(Text, default="Carry salbutamol inhaler in pocket; allergic to penicillin.")
    
    worker = relationship("Worker", back_populates="emergency_profile")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    record_type = Column(String(50), default="Consultation") # Consultation, Lab Test, Vaccine, Injury
    diagnosis = Column(String(255), nullable=False)
    symptoms = Column(Text, nullable=True)
    treatment_notes = Column(Text, nullable=True)
    recorded_date = Column(String(20), nullable=False) # YYYY-MM-DD
    created_at = Column(DateTime, default=utc_now)
    
    worker = relationship("Worker", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="consultations")
    prescription = relationship("Prescription", back_populates="medical_record", uselist=False)

class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=True)
    diagnosis = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    valid_until = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    worker = relationship("Worker", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    medical_record = relationship("MedicalRecord", back_populates="prescription")
    medications = relationship("Medication", back_populates="prescription", cascade="all, delete-orphan")

class Medication(Base):
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    drug_name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False) # e.g. 500mg
    frequency = Column(String(50), nullable=False) # e.g. 1-0-1 (Morning & Night)
    timing = Column(String(50), default="After Food") # Before Food, After Food
    duration_days = Column(Integer, default=5)
    instructions = Column(String(255), nullable=True)
    
    prescription = relationship("Prescription", back_populates="medications")

class MedicalDocument(Base):
    __tablename__ = "medical_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    document_title = Column(String(150), nullable=False)
    document_type = Column(String(50), default="Lab Report") # Prescription, Lab Report, Discharge Summary
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(50), default="application/pdf")
    ocr_status = Column(String(20), default="processed") # pending, processed, verified
    raw_ocr_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    worker = relationship("Worker", back_populates="medical_documents")
    entities = relationship("ExtractedDocumentEntity", back_populates="document", cascade="all, delete-orphan")

class ExtractedDocumentEntity(Base):
    __tablename__ = "extracted_document_entities"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("medical_documents.id"), nullable=False)
    field_name = Column(String(100), nullable=False) # e.g. Hemoglobin, Blood Sugar, Platelet Count
    field_value = Column(String(100), nullable=False)
    confidence_score = Column(Float, default=0.95) # 0.0 to 1.0
    is_verified_by_user = Column(Boolean, default=False)
    
    document = relationship("MedicalDocument", back_populates="entities")

class ConsentRequest(Base):
    __tablename__ = "consent_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    status = Column(String(20), default="pending") # pending, active, revoked, expired, declined
    requested_scopes = Column(Text, default='["medical_history", "prescriptions", "lab_reports"]') # JSON array string
    duration_hours = Column(Integer, default=24)
    granted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    worker = relationship("Worker", back_populates="consent_requests")
    doctor = relationship("Doctor", back_populates="consent_requests")

class AccessAuditLog(Base):
    __tablename__ = "access_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    actor_user_id = Column(Integer, nullable=False)
    actor_role = Column(String(20), nullable=False) # doctor, hospital, worker, admin
    actor_name = Column(String(100), nullable=False)
    hospital_name = Column(String(150), nullable=True)
    action = Column(String(50), nullable=False) # VIEWED_RECORDS, GRANTED_CONSENT, REVOKED_CONSENT, ISSUED_PRESCRIPTION
    details = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=utc_now)
    ip_address = Column(String(50), default="127.0.0.1")
    
    worker = relationship("Worker", back_populates="audit_logs")

class Vaccination(Base):
    __tablename__ = "vaccinations"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    vaccine_name = Column(String(100), nullable=False) # Tetanus Toxoid, Hepatitis B, COVID-19
    dose_number = Column(String(20), default="Dose 1")
    administered_date = Column(String(20), nullable=False) # YYYY-MM-DD
    batch_number = Column(String(50), default="TT-89312")
    administered_facility = Column(String(150), default="Primary Health Center, Trichy")
    next_due_date = Column(String(20), nullable=True)
    
    worker = relationship("Worker", back_populates="vaccinations")

class OccupationalProfile(Base):
    __tablename__ = "occupational_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), unique=True, nullable=False)
    primary_industry = Column(String(50), default="Construction") # Construction, Factory, Agriculture, Transport, Hospitality
    current_workplace = Column(String(150), default="Metro Rail Project, Site 4, Bengaluru")
    years_in_field = Column(Integer, default=7)
    hazard_exposures = Column(Text, default='["Silica Dust", "High Noise (>85dB)", "Heavy Lifting", "Extreme Heat"]')
    last_safety_training = Column(String(20), default="2026-03-10")
    
    worker = relationship("Worker", back_populates="occupational_profile")

class HealthScreening(Base):
    __tablename__ = "health_screenings"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    screening_date = Column(String(20), nullable=False) # YYYY-MM-DD
    systolic_bp = Column(Integer, default=120)
    diastolic_bp = Column(Integer, default=80)
    pulse_rate = Column(Integer, default=74)
    blood_glucose = Column(Integer, default=95) # mg/dL fasting
    weight_kg = Column(Float, default=66.5)
    height_cm = Column(Float, default=172.0)
    bmi = Column(Float, default=22.5)
    respiratory_symptom_flag = Column(Boolean, default=False)
    musculoskeletal_flag = Column(Boolean, default=False)
    hearing_screen_flag = Column(Boolean, default=False)
    
    worker = relationship("Worker", back_populates="health_screenings")

class MedicationReminder(Base):
    __tablename__ = "medication_reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50), default="1 tablet")
    reminder_time = Column(String(10), nullable=False) # HH:MM (e.g. 08:00, 14:00, 20:00)
    timing_label = Column(String(50), default="After Lunch")
    is_active = Column(Boolean, default=True)
    
    worker = relationship("Worker", back_populates="medication_reminders")

class HealthcareFacility(Base):
    __tablename__ = "healthcare_facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    facility_type = Column(String(50), nullable=False) # Government Hospital, ESI Clinic, Jan Aushadhi, Trust Hospital
    city = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    emergency_available = Column(Boolean, default=True)
    has_free_opd = Column(Boolean, default=True)
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="consent_request") # consent_request, prescription_ready, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User", back_populates="notifications")
