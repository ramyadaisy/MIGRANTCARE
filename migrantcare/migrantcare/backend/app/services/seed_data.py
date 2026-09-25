import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.models import (
    User, Worker, Doctor, Hospital, EmergencyProfile, MedicalRecord,
    Prescription, Medication, MedicalDocument, ExtractedDocumentEntity,
    ConsentRequest, AccessAuditLog, Vaccination, OccupationalProfile,
    HealthScreening, MedicationReminder, HealthcareFacility, Notification
)
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).filter(User.email_or_phone == "arun@migrantcare.org").first():
        return

    utc_now = datetime.now(timezone.utc)
    hashed_pwd = get_password_hash("Password123!")

    # 1. Create Worker User
    worker_user = User(
        email_or_phone="arun@migrantcare.org",
        hashed_password=hashed_pwd,
        role="worker",
        is_active=True
    )
    db.add(worker_user)
    db.flush()

    worker = Worker(
        user_id=worker_user.id,
        health_id="MC-2026-001245",
        full_name="Arun Kumar",
        date_of_birth="1994-05-14",
        gender="Male",
        blood_group="O+",
        phone="+91 98412 34567",
        home_state="Tamil Nadu",
        current_state="Karnataka",
        current_city="Bengaluru",
        preferred_language="ta"
    )
    db.add(worker)
    db.flush()

    # Worker Emergency Profile
    emergency_prof = EmergencyProfile(
        worker_id=worker.id,
        critical_allergies="Severe Penicillin Allergy, Sulfa Drugs",
        chronic_conditions="Mild Dust-Induced Occupational Asthma",
        blood_group="O+",
        emergency_contact_name="Murugan (Elder Brother)",
        emergency_contact_relation="Brother",
        emergency_contact_phone="+91 98765 43210",
        organ_donor=True,
        special_instructions="Carries Salbutamol rescue inhaler. Do NOT administer penicillin-class antibiotics."
    )
    db.add(emergency_prof)

    # Worker Occupational Profile
    occupational_prof = OccupationalProfile(
        worker_id=worker.id,
        primary_industry="Construction",
        current_workplace="Namma Metro Phase 2 Project, Site 4, Bengaluru",
        years_in_field=8,
        hazard_exposures='["Silica & Cement Dust", "High Acoustic Noise (>85dB)", "Repetitive Heavy Lifting", "High Ambient Heat"]',
        last_safety_training="2026-02-15"
    )
    db.add(occupational_prof)

    # 2. Create Doctor User
    doctor_user = User(
        email_or_phone="dr.rajesh@migrantcare.org",
        hashed_password=hashed_pwd,
        role="doctor",
        is_active=True
    )
    db.add(doctor_user)
    db.flush()

    doctor = Doctor(
        user_id=doctor_user.id,
        doctor_code="DOC-9842",
        full_name="Dr. Rajesh Kumar, MBBS, MD",
        specialization="Internal & Occupational Medicine",
        registration_number="KMC-84729",
        hospital_name="Victoria Government Hospital & Trauma Care",
        city="Bengaluru",
        state="Karnataka",
        is_verified=True
    )
    db.add(doctor)
    db.flush()

    # 3. Create Hospital User
    hospital_user = User(
        email_or_phone="hospital@migrantcare.org",
        hashed_password=hashed_pwd,
        role="hospital",
        is_active=True
    )
    db.add(hospital_user)
    db.flush()

    hospital = Hospital(
        user_id=hospital_user.id,
        hospital_name="Victoria Government Hospital & Trauma Care",
        facility_type="Government District Hospital",
        license_number="HOSP-BLR-2021-99",
        city="Bengaluru",
        state="Karnataka",
        contact_number="+91 80 2670 1150",
        bed_count=650
    )
    db.add(hospital)

    # 4. Create Admin User
    admin_user = User(
        email_or_phone="admin@migrantcare.org",
        hashed_password=hashed_pwd,
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    db.flush()

    # 5. Create Medical Records & Prescriptions
    rec1 = MedicalRecord(
        worker_id=worker.id,
        doctor_id=doctor.id,
        record_type="Hospital Visit",
        diagnosis="Acute Bronchitis & Dry Cough",
        symptoms="Persistent dry cough for 2 weeks, throat irritation from cement dust exposure.",
        treatment_notes="Lungs clear bilaterally. Advised N95 dust mask on construction site, steam inhalation twice daily.",
        recorded_date="2026-06-12"
    )
    db.add(rec1)
    db.flush()

    rx1 = Prescription(
        worker_id=worker.id,
        doctor_id=doctor.id,
        record_id=rec1.id,
        diagnosis="Acute Bronchitis & Dust Irritation",
        notes="Avoid cold drinks; use dust protection mask on construction site.",
        valid_until="2026-12-31"
    )
    db.add(rx1)
    db.flush()

    med1 = Medication(
        prescription_id=rx1.id,
        drug_name="Levocetirizine 5mg",
        dosage="5mg",
        frequency="0-0-1 (Night)",
        timing="After Dinner",
        duration_days=5,
        instructions="Takes at bedtime; may cause mild drowsiness."
    )
    med2 = Medication(
        prescription_id=rx1.id,
        drug_name="Salbutamol Inhaler 100mcg",
        dosage="2 puffs",
        frequency="SOS (As needed)",
        timing="When breathless",
        duration_days=30,
        instructions="Rinse mouth with water after inhalation."
    )
    db.add_all([med1, med2])

    rec2 = MedicalRecord(
        worker_id=worker.id,
        doctor_id=doctor.id,
        record_type="Lab Test",
        diagnosis="Routine Pre-Employment & Occupational Vitals",
        symptoms="Routine baseline screening before starting Metro Phase 2 work.",
        treatment_notes="Blood counts within normal limits. Fasting blood sugar normal. Bilateral audiometry normal.",
        recorded_date="2026-08-10"
    )
    db.add(rec2)

    rec3 = MedicalRecord(
        worker_id=worker.id,
        doctor_id=doctor.id,
        record_type="Vaccination",
        diagnosis="Tetanus Toxoid Booster",
        symptoms="Minor abrasion on right forearm at construction yard.",
        treatment_notes="Wound thoroughly cleaned with saline and dressed. Tetanus booster given.",
        recorded_date="2026-08-25"
    )
    db.add(rec3)

    # 6. Vaccinations
    vac1 = Vaccination(
        worker_id=worker.id,
        vaccine_name="Tetanus Toxoid (TT)",
        dose_number="Booster Dose",
        administered_date="2026-08-25",
        batch_number="TT-9042A",
        administered_facility="Victoria Government Hospital, Bengaluru",
        next_due_date="2031-08-25"
    )
    vac2 = Vaccination(
        worker_id=worker.id,
        vaccine_name="Hepatitis B",
        dose_number="Dose 3 of 3",
        administered_date="2025-11-10",
        batch_number="HEP-4421X",
        administered_facility="Primary Health Center, Trichy",
        next_due_date="Completed"
    )
    vac3 = Vaccination(
        worker_id=worker.id,
        vaccine_name="COVID-19 Precautionary Dose",
        dose_number="Dose 3 (Precaution)",
        administered_date="2024-04-18",
        batch_number="COV-77123",
        administered_facility="Government District Hospital, Tiruchirappalli",
        next_due_date="Completed"
    )
    db.add_all([vac1, vac2, vac3])

    # 7. Health Screening Vitals History (for charts)
    screenings = [
        HealthScreening(worker_id=worker.id, screening_date="2026-05-10", systolic_bp=124, diastolic_bp=82, pulse_rate=76, blood_glucose=92, weight_kg=65.0, height_cm=172.0, bmi=22.0),
        HealthScreening(worker_id=worker.id, screening_date="2026-06-12", systolic_bp=128, diastolic_bp=84, pulse_rate=80, blood_glucose=95, weight_kg=65.5, height_cm=172.0, bmi=22.1),
        HealthScreening(worker_id=worker.id, screening_date="2026-07-15", systolic_bp=122, diastolic_bp=80, pulse_rate=74, blood_glucose=99, weight_kg=66.0, height_cm=172.0, bmi=22.3),
        HealthScreening(worker_id=worker.id, screening_date="2026-08-10", systolic_bp=118, diastolic_bp=78, pulse_rate=72, blood_glucose=98, weight_kg=66.2, height_cm=172.0, bmi=22.4),
        HealthScreening(worker_id=worker.id, screening_date="2026-09-18", systolic_bp=120, diastolic_bp=80, pulse_rate=74, blood_glucose=96, weight_kg=66.5, height_cm=172.0, bmi=22.5),
    ]
    db.add_all(screenings)

    # 8. Medication Reminders
    rem1 = MedicationReminder(
        worker_id=worker.id,
        medication_name="Levocetirizine 5mg (Allergy/Cough)",
        dosage="1 Tablet",
        reminder_time="21:00",
        timing_label="Night, After Dinner",
        is_active=True
    )
    rem2 = MedicationReminder(
        worker_id=worker.id,
        medication_name="Multivitamin & Zinc",
        dosage="1 Capsule",
        reminder_time="08:30",
        timing_label="Morning, After Breakfast",
        is_active=True
    )
    db.add_all([rem1, rem2])

    # 9. Medical Document & Extracted Entities
    doc1 = MedicalDocument(
        worker_id=worker.id,
        document_title="Complete Blood Count & Glucose Panel",
        document_type="Lab Report",
        file_path="uploads/sample_blood_report.pdf",
        file_size=245000,
        mime_type="application/pdf",
        ocr_status="verified",
        raw_ocr_text="SHREE BALAJI DIAGNOSTICS & CLINICAL LAB\nHb: 13.2 g/dL\nFBS: 98 mg/dL\nTotal WBC: 7400 /cumm\nPlatelet: 2.4 Lakhs/cumm\nBP: 120/80 mmHg"
    )
    db.add(doc1)
    db.flush()

    entities = [
        ExtractedDocumentEntity(document_id=doc1.id, field_name="Hemoglobin", field_value="13.2 g/dL", confidence_score=0.96, is_verified_by_user=True),
        ExtractedDocumentEntity(document_id=doc1.id, field_name="Fasting Blood Sugar", field_value="98 mg/dL", confidence_score=0.94, is_verified_by_user=True),
        ExtractedDocumentEntity(document_id=doc1.id, field_name="Total WBC Count", field_value="7,400 /cumm", confidence_score=0.89, is_verified_by_user=True),
        ExtractedDocumentEntity(document_id=doc1.id, field_name="Platelet Count", field_value="2.4 Lakhs/cumm", confidence_score=0.88, is_verified_by_user=True),
    ]
    db.add_all(entities)

    # 10. Audit Logs (Transparency Engine)
    log1 = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=doctor_user.id,
        actor_role="doctor",
        actor_name="Dr. Rajesh Kumar",
        hospital_name="Victoria Government Hospital",
        action="VIEWED_RECORDS",
        details="Authorized OPD review of past prescriptions and allergies under 24-hr token.",
        timestamp=utc_now - timedelta(hours=4),
        ip_address="103.22.45.18"
    )
    log2 = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=worker_user.id,
        actor_role="worker",
        actor_name="Arun Kumar",
        hospital_name="Self-Service Portal",
        action="GRANTED_CONSENT",
        details="Approved 24-hour access to Dr. Rajesh Kumar for Medical History and Prescriptions.",
        timestamp=utc_now - timedelta(hours=4, minutes=5),
        ip_address="157.48.91.204"
    )
    db.add_all([log1, log2])

    # 11. Healthcare Facilities Directory
    facilities = [
        HealthcareFacility(
            name="Victoria Government Hospital & Trauma Center",
            facility_type="Government Hospital",
            city="Bengaluru",
            state="Karnataka",
            address="Fort Road, Near City Market, Kalasipalya, Bengaluru 560002",
            phone="+91 80 2670 1150",
            emergency_available=True,
            has_free_opd=True,
            latitude=12.9629,
            longitude=77.5756
        ),
        HealthcareFacility(
            name="ESI Hospital Indiranagar",
            facility_type="ESI Clinic",
            city="Bengaluru",
            state="Karnataka",
            address="100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
            phone="+91 80 2526 6902",
            emergency_available=True,
            has_free_opd=True,
            latitude=12.9719,
            longitude=77.6412
        ),
        HealthcareFacility(
            name="Pradhan Mantri Jan Aushadhi Kendra (Kalasipalya)",
            facility_type="Jan Aushadhi Pharmacy",
            city="Bengaluru",
            state="Karnataka",
            address="Shop #14, Main Market Complex, Kalasipalya, Bengaluru",
            phone="+91 94801 22334",
            emergency_available=False,
            has_free_opd=False,
            latitude=12.9615,
            longitude=77.5760
        ),
        HealthcareFacility(
            name="Bowring and Lady Curzon Hospital",
            facility_type="Government Hospital",
            city="Bengaluru",
            state="Karnataka",
            address="Hospital Road, Shivaji Nagar, Bengaluru 560001",
            phone="+91 80 2559 1362",
            emergency_available=True,
            has_free_opd=True,
            latitude=12.9822,
            longitude=77.6047
        ),
        HealthcareFacility(
            name="Mahatma Gandhi Memorial Government Hospital",
            facility_type="Government Hospital",
            city="Tiruchirappalli",
            state="Tamil Nadu",
            address="Puthur High Road, Tiruchirappalli 620017",
            phone="+91 431 277 0111",
            emergency_available=True,
            has_free_opd=True,
            latitude=10.8060,
            longitude=78.6856
        ),
        HealthcareFacility(
            name="Rajiv Gandhi Government General Hospital",
            facility_type="Government Hospital",
            city="Chennai",
            state="Tamil Nadu",
            address="EVR Periyar Salai, Park Town, Chennai 600003",
            phone="+91 44 2530 5000",
            emergency_available=True,
            has_free_opd=True,
            latitude=13.0827,
            longitude=80.2785
        ),
    ]
    db.add_all(facilities)

    # 12. Seed Notification
    notif = Notification(
        user_id=worker_user.id,
        title="Welcome to MigrantCare",
        message="Your portable digital Health ID MC-2026-001245 is active. Scan or present your QR card at any hospital.",
        type="alert",
        is_read=False
    )
    db.add(notif)

    db.commit()

