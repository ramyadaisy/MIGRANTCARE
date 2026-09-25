from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
import os
import shutil
from typing import List, Optional

from app.db.database import get_db
from app.db.models import (
    User, Worker, Doctor, MedicalRecord, Prescription, Medication,
    MedicalDocument, ExtractedDocumentEntity, AccessAuditLog, Notification, Vaccination
)
from app.api.auth import get_current_user
from app.api.consent import get_active_consent
from app.services.ocr_service import ocr_service
from app.core.config import settings

router = APIRouter(prefix="/records", tags=["Medical Records & Vault"])

# Worker self-service endpoints
@router.get("/my-timeline")
def get_worker_timeline(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    records = db.query(MedicalRecord).filter(MedicalRecord.worker_id == worker.id).order_by(MedicalRecord.recorded_date.desc()).all()
    
    timeline = []
    for r in records:
        doc = r.doctor
        timeline.append({
            "id": r.id,
            "record_type": r.record_type,
            "diagnosis": r.diagnosis,
            "symptoms": r.symptoms,
            "treatment_notes": r.treatment_notes,
            "recorded_date": r.recorded_date,
            "doctor_name": doc.full_name if doc else "Attending Clinician",
            "hospital_name": doc.hospital_name if doc else "Healthcare Facility"
        })
    return timeline

@router.post("/my-records")
def add_my_medical_record(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    worker = current_user.worker_profile
    rec = MedicalRecord(
        worker_id=worker.id,
        record_type=data.get("record_type", "Consultation"),
        diagnosis=data.get("diagnosis", "Health Checkup"),
        symptoms=data.get("symptoms", ""),
        treatment_notes=data.get("treatment_notes", ""),
        recorded_date=data.get("recorded_date", datetime.now().strftime("%Y-%m-%d"))
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "record_type": rec.record_type,
        "diagnosis": rec.diagnosis,
        "symptoms": rec.symptoms,
        "treatment_notes": rec.treatment_notes,
        "recorded_date": rec.recorded_date,
        "doctor_name": data.get("doctor_name", "Previous Clinic Doctor"),
        "hospital_name": data.get("hospital_name", "Primary Health Center")
    }

@router.post("/my-prescriptions")
def add_my_prescription(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    worker = current_user.worker_profile
    rx = Prescription(
        worker_id=worker.id,
        diagnosis=data.get("diagnosis", "Prescription"),
        notes=data.get("notes", ""),
        valid_until=data.get("valid_until", "2027-12-31")
    )
    db.add(rx)
    db.flush()
    meds = data.get("medications", [])
    for m in meds:
        med = Medication(
            prescription_id=rx.id,
            drug_name=m.get("drug_name", "Medicine"),
            dosage=m.get("dosage", "1 dose"),
            frequency=m.get("frequency", "1-0-1"),
            timing=m.get("timing", "After Food"),
            duration_days=int(m.get("duration_days", 5)),
            instructions=m.get("instructions", "")
        )
        db.add(med)
    db.commit()
    return {"message": "Prescription added successfully", "id": rx.id}

@router.get("/my-prescriptions")
def get_worker_prescriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    prescriptions = db.query(Prescription).filter(Prescription.worker_id == worker.id).order_by(Prescription.created_at.desc()).all()
    
    results = []
    for p in prescriptions:
        doc = p.doctor
        results.append({
            "id": p.id,
            "diagnosis": p.diagnosis,
            "notes": p.notes,
            "valid_until": p.valid_until,
            "created_at": p.created_at,
            "doctor_name": doc.full_name if doc else "Attending Clinician",
            "hospital_name": doc.hospital_name if doc else "Hospital",
            "medications": [
                {
                    "id": m.id,
                    "drug_name": m.drug_name,
                    "dosage": m.dosage,
                    "frequency": m.frequency,
                    "timing": m.timing,
                    "duration_days": m.duration_days,
                    "instructions": m.instructions
                } for m in p.medications
            ]
        })
    return results

@router.get("/my-documents")
def get_worker_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    docs = db.query(MedicalDocument).filter(MedicalDocument.worker_id == worker.id).order_by(MedicalDocument.created_at.desc()).all()
    
    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "document_title": d.document_title,
            "document_type": d.document_type,
            "ocr_status": d.ocr_status,
            "raw_ocr_text": d.raw_ocr_text,
            "created_at": d.created_at,
            "entities": [
                {
                    "id": e.id,
                    "field_name": e.field_name,
                    "field_value": e.field_value,
                    "confidence_score": e.confidence_score,
                    "is_verified": e.is_verified_by_user
                } for e in d.entities
            ]
        })
    return results

@router.post("/upload-document")
async def upload_medical_document(
    file: UploadFile = File(...),
    document_title: str = Form("Diagnostic Lab Report"),
    document_type: str = Form("Lab Report"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    
    # Secure storage
    safe_filename = f"{worker.health_id}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = os.path.getsize(file_path)

    # Perform AI / Optical extraction
    ocr_result = ocr_service.extract_text_and_entities(file_path, document_type)

    doc = MedicalDocument(
        worker_id=worker.id,
        document_title=document_title,
        document_type=document_type,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        ocr_status="processed", # Awaiting verification
        raw_ocr_text=ocr_result["raw_text"]
    )
    db.add(doc)
    db.flush()

    # Save extracted entities with confidence
    entities_response = []
    for item in ocr_result["entities"]:
        entity = ExtractedDocumentEntity(
            document_id=doc.id,
            field_name=item["field_name"],
            field_value=item["field_value"],
            confidence_score=item["confidence_score"],
            is_verified_by_user=False
        )
        db.add(entity)
        db.flush()
        entities_response.append({
            "id": entity.id,
            "field_name": entity.field_name,
            "field_value": entity.field_value,
            "confidence_score": entity.confidence_score,
            "is_verified": False
        })
    
    db.commit()

    return {
        "document_id": doc.id,
        "document_title": doc.document_title,
        "document_type": doc.document_type,
        "ocr_status": "processed",
        "raw_ocr_text": doc.raw_ocr_text,
        "extracted_entities": entities_response
    }

@router.post("/verify-entities")
def verify_document_entities(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Human-in-the-loop: user verifies and edits extracted lab numbers before committing to health record."""
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    document_id = data.get("document_id")
    verified_items = data.get("verified_entities", [])

    doc = db.query(MedicalDocument).filter(
        MedicalDocument.id == document_id,
        MedicalDocument.worker_id == current_user.worker_profile.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    for item in verified_items:
        entity_id = item.get("id")
        if entity_id:
            e = db.query(ExtractedDocumentEntity).filter(ExtractedDocumentEntity.id == entity_id).first()
            if e:
                e.field_name = item.get("field_name", e.field_name)
                e.field_value = item.get("field_value", e.field_value)
                e.is_verified_by_user = True

    doc.ocr_status = "verified"

    # Add a verified entry in MedicalRecord timeline
    rec = MedicalRecord(
        worker_id=current_user.worker_profile.id,
        record_type="Lab Report",
        diagnosis=f"Verified Lab Upload: {doc.document_title}",
        symptoms="Document digitized via AI OCR and verified by worker.",
        treatment_notes=", ".join([f"{i.get('field_name')}: {i.get('field_value')}" for i in verified_items]),
        recorded_date=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(rec)
    db.commit()

    return {"message": "Document verified and integrated into official health timeline"}

# Doctor accessing records with active consent
@router.get("/doctor-view/{worker_health_id}")
def doctor_view_records(worker_health_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Only doctors can view patient records")
    
    doctor = current_user.doctor_profile
    worker = db.query(Worker).filter(Worker.health_id == worker_health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Consent verification check
    consent = get_active_consent(worker.id, doctor.id, db)
    if not consent:
        raise HTTPException(status_code=403, detail="No active consent found. Request authorization from worker first.")

    scopes = json.loads(consent.requested_scopes) if consent.requested_scopes else []

    # Write immutable audit entry
    audit = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=doctor.user_id,
        actor_role="doctor",
        actor_name=doctor.full_name,
        hospital_name=doctor.hospital_name,
        action="VIEWED_RECORDS",
        details=f"Doctor inspected authorized clinical scopes: {', '.join(scopes)}."
    )
    db.add(audit)
    db.commit()

    ep = worker.emergency_profile
    op = worker.occupational_profile

    # Assemble scoped response
    data = {
        "worker": {
            "health_id": worker.health_id,
            "full_name": worker.full_name,
            "date_of_birth": worker.date_of_birth,
            "gender": worker.gender,
            "blood_group": worker.blood_group,
            "home_state": worker.home_state,
            "current_city": worker.current_city,
            "current_state": worker.current_state,
            "critical_allergies": ep.critical_allergies if ep else "None",
            "chronic_conditions": ep.chronic_conditions if ep else "None",
            "emergency_contact": f"{ep.emergency_contact_name} ({ep.emergency_contact_phone})" if ep else "N/A",
            "occupation": op.primary_industry if op else "General Labor",
            "hazard_exposures": json.loads(op.hazard_exposures) if op and op.hazard_exposures else []
        },
        "consent_info": {
            "expires_at": consent.expires_at,
            "scopes": scopes
        },
        "timeline": [],
        "prescriptions": [],
        "vaccinations": []
    }

    if "medical_history" in scopes:
        records = db.query(MedicalRecord).filter(MedicalRecord.worker_id == worker.id).order_by(MedicalRecord.recorded_date.desc()).all()
        data["timeline"] = [
            {
                "id": r.id,
                "record_type": r.record_type,
                "diagnosis": r.diagnosis,
                "symptoms": r.symptoms,
                "treatment_notes": r.treatment_notes,
                "recorded_date": r.recorded_date,
                "doctor_name": r.doctor.full_name if r.doctor else "Attending Clinician"
            } for r in records
        ]

    if "prescriptions" in scopes:
        prescriptions = db.query(Prescription).filter(Prescription.worker_id == worker.id).order_by(Prescription.created_at.desc()).all()
        data["prescriptions"] = [
            {
                "id": p.id,
                "diagnosis": p.diagnosis,
                "notes": p.notes,
                "created_at": p.created_at,
                "medications": [
                    {
                        "drug_name": m.drug_name,
                        "dosage": m.dosage,
                        "frequency": m.frequency,
                        "timing": m.timing,
                        "duration_days": m.duration_days,
                        "instructions": m.instructions
                    } for m in p.medications
                ]
            } for p in prescriptions
        ]

    # Include vaccinations for occupational safety
    vaccines = db.query(Vaccination).filter(Vaccination.worker_id == worker.id).all()
    data["vaccinations"] = [
        {
            "vaccine_name": v.vaccine_name,
            "dose_number": v.dose_number,
            "administered_date": v.administered_date,
            "batch_number": v.batch_number
        } for v in vaccines
    ]

    return data

@router.post("/doctor-consultation")
def add_doctor_consultation(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Only doctors can add consultations")
    
    doctor = current_user.doctor_profile
    worker_health_id = data.get("worker_health_id")
    worker = db.query(Worker).filter(Worker.health_id == worker_health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    consent = get_active_consent(worker.id, doctor.id, db)
    if not consent:
        raise HTTPException(status_code=403, detail="Active consent required to issue medical consultation")

    diagnosis = data.get("diagnosis", "Clinical Consultation")
    symptoms = data.get("symptoms", "")
    treatment_notes = data.get("treatment_notes", "")
    medications_data = data.get("medications", [])

    # 1. Add MedicalRecord
    rec = MedicalRecord(
        worker_id=worker.id,
        doctor_id=doctor.id,
        record_type="Doctor Consultation",
        diagnosis=diagnosis,
        symptoms=symptoms,
        treatment_notes=treatment_notes,
        recorded_date=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(rec)
    db.flush()

    # 2. Add Prescription if medications provided
    if medications_data:
        rx = Prescription(
            worker_id=worker.id,
            doctor_id=doctor.id,
            record_id=rec.id,
            diagnosis=diagnosis,
            notes=treatment_notes,
            valid_until=(datetime.now() + os.sys.modules['datetime'].timedelta(days=30)).strftime("%Y-%m-%d")
        )
        db.add(rx)
        db.flush()

        for med in medications_data:
            m = Medication(
                prescription_id=rx.id,
                drug_name=med.get("drug_name"),
                dosage=med.get("dosage", "1 tablet"),
                frequency=med.get("frequency", "1-0-1"),
                timing=med.get("timing", "After Food"),
                duration_days=int(med.get("duration_days", 5)),
                instructions=med.get("instructions", "Take with water.")
            )
            db.add(m)

    # 3. Notify Worker
    notif = Notification(
        user_id=worker.user_id,
        title=f"New Prescription from {doctor.full_name}",
        message=f"{doctor.full_name} ({doctor.hospital_name}) has added a consultation and prescription to your timeline.",
        type="prescription_ready"
    )
    db.add(notif)

    # 4. Audit Log
    audit = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=doctor.user_id,
        actor_role="doctor",
        actor_name=doctor.full_name,
        hospital_name=doctor.hospital_name,
        action="ISSUED_PRESCRIPTION",
        details=f"Doctor recorded diagnosis: {diagnosis} and prescribed {len(medications_data)} medication(s)."
    )
    db.add(audit)
    db.commit()

    return {"message": "Consultation and prescription successfully recorded and sent to worker passport"}
