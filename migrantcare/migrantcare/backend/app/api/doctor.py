from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.db.database import get_db
from app.db.models import User, Doctor, Worker, ConsentRequest, MedicalRecord, Prescription
from app.api.auth import get_current_user

router = APIRouter(prefix="/doctor", tags=["Doctor Portal Services"])

def get_current_doctor(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Doctor:
    if current_user.role != "doctor" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Doctor access required")
    return current_user.doctor_profile

@router.get("/dashboard-stats")
def get_doctor_dashboard(doctor: Doctor = Depends(get_current_doctor), db: Session = Depends(get_db)):
    # Count pending requests
    pending_count = db.query(ConsentRequest).filter(
        ConsentRequest.doctor_id == doctor.id,
        ConsentRequest.status == "pending"
    ).count()

    # Count active authorizations
    active_consents = db.query(ConsentRequest).filter(
        ConsentRequest.doctor_id == doctor.id,
        ConsentRequest.status == "active"
    ).all()

    # Recent consultations
    recent_records = db.query(MedicalRecord).filter(
        MedicalRecord.doctor_id == doctor.id
    ).order_by(MedicalRecord.created_at.desc()).limit(10).all()

    consultation_list = []
    for r in recent_records:
        w = r.worker
        consultation_list.append({
            "id": r.id,
            "worker_name": w.full_name if w else "Patient",
            "health_id": w.health_id if w else "MC-N/A",
            "diagnosis": r.diagnosis,
            "recorded_date": r.recorded_date
        })

    return {
        "doctor_name": doctor.full_name,
        "doctor_code": doctor.doctor_code,
        "specialization": doctor.specialization,
        "hospital_name": doctor.hospital_name,
        "pending_requests_count": pending_count,
        "active_consents_count": len(active_consents),
        "recent_consultations": consultation_list
    }

@router.get("/search-worker/{health_id}")
def search_worker(health_id: str, doctor: Doctor = Depends(get_current_doctor), db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.health_id == health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker Health ID not found. Verify the ID or QR scan.")

    # Check active consent
    consent = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker.id,
        ConsentRequest.doctor_id == doctor.id,
        ConsentRequest.status == "active"
    ).first()

    has_active_consent = False
    if consent and consent.expires_at:
        exp = consent.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp > datetime.now(timezone.utc):
            has_active_consent = True

    # Check pending
    pending = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker.id,
        ConsentRequest.doctor_id == doctor.id,
        ConsentRequest.status == "pending"
    ).first()

    return {
        "health_id": worker.health_id,
        "full_name": worker.full_name,
        "blood_group": worker.blood_group,
        "has_active_consent": has_active_consent,
        "has_pending_request": pending is not None,
        "expires_at": consent.expires_at if has_active_consent else None
    }
