from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import json
from typing import List

from app.db.database import get_db
from app.db.models import User, Worker, Doctor, ConsentRequest, AccessAuditLog, Notification
from app.api.auth import get_current_user
from app.schemas.schemas import ConsentCreateRequest, ConsentApprovalRequest, ConsentRevokeRequest, ConsentResponse

router = APIRouter(prefix="/consent", tags=["Consent & Access Control"])

def get_active_consent(worker_id: int, doctor_id: int, db: Session):
    now = datetime.now(timezone.utc)
    # Filter for active consent
    consent = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker_id,
        ConsentRequest.doctor_id == doctor_id,
        ConsentRequest.status == "active"
    ).order_by(ConsentRequest.granted_at.desc()).first()
    
    if consent and consent.expires_at:
        # Check expiration
        expires = consent.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires > now:
            return consent
        else:
            consent.status = "expired"
            db.commit()
    return None

@router.post("/request")
def request_access(data: ConsentCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Only verified doctors can request record access")
    
    doctor = current_user.doctor_profile
    worker = db.query(Worker).filter(Worker.health_id == data.worker_health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail=f"Worker with Health ID {data.worker_health_id} not found")

    # Check if active consent already exists
    existing_active = get_active_consent(worker.id, doctor.id, db)
    if existing_active:
        return {
            "status": "already_active",
            "message": "You already have active authorization for this worker.",
            "consent_id": existing_active.id,
            "expires_at": existing_active.expires_at
        }

    # Create new pending consent request
    consent = ConsentRequest(
        worker_id=worker.id,
        doctor_id=doctor.id,
        status="pending",
        requested_scopes=json.dumps(data.requested_scopes),
        duration_hours=data.duration_hours
    )
    db.add(consent)
    
    # Notify worker
    notif = Notification(
        user_id=worker.user_id,
        title=f"Access Request from {doctor.full_name}",
        message=f"{doctor.full_name} ({doctor.hospital_name}) is requesting {data.duration_hours}-hour access to your health records.",
        type="consent_request"
    )
    db.add(notif)
    db.commit()
    db.refresh(consent)

    return {
        "status": "pending",
        "message": f"Access request sent to {worker.full_name}. Awaiting worker approval.",
        "consent_id": consent.id
    }

@router.get("/status")
def check_consent_status(worker_health_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "doctor" or not current_user.doctor_profile:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    doctor = current_user.doctor_profile
    worker = db.query(Worker).filter(Worker.health_id == worker_health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    active_consent = get_active_consent(worker.id, doctor.id, db)
    if active_consent:
        scopes = json.loads(active_consent.requested_scopes) if active_consent.requested_scopes else []
        return {
            "authorized": True,
            "status": "active",
            "consent_id": active_consent.id,
            "scopes": scopes,
            "expires_at": active_consent.expires_at,
            "worker_name": worker.full_name,
            "blood_group": worker.blood_group
        }
    
    # Check pending
    pending = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker.id,
        ConsentRequest.doctor_id == doctor.id,
        ConsentRequest.status == "pending"
    ).order_by(ConsentRequest.created_at.desc()).first()

    return {
        "authorized": False,
        "status": "pending" if pending else "none",
        "consent_id": pending.id if pending else None
    }

@router.get("/pending")
def list_pending_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    requests = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker.id,
        ConsentRequest.status == "pending"
    ).all()

    results = []
    for r in requests:
        doc = r.doctor
        results.append({
            "id": r.id,
            "doctor_name": doc.full_name if doc else "Doctor",
            "hospital_name": doc.hospital_name if doc else "Hospital",
            "specialization": doc.specialization if doc else "Physician",
            "requested_scopes": json.loads(r.requested_scopes) if r.requested_scopes else ["medical_history", "prescriptions"],
            "duration_hours": r.duration_hours,
            "created_at": r.created_at
        })
    return results

@router.get("/active-grants")
def list_active_grants(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    now = datetime.now(timezone.utc)
    grants = db.query(ConsentRequest).filter(
        ConsentRequest.worker_id == worker.id,
        ConsentRequest.status == "active"
    ).all()

    results = []
    for g in grants:
        doc = g.doctor
        results.append({
            "id": g.id,
            "doctor_name": doc.full_name if doc else "Doctor",
            "hospital_name": doc.hospital_name if doc else "Hospital",
            "scopes": json.loads(g.requested_scopes) if g.requested_scopes else [],
            "granted_at": g.granted_at,
            "expires_at": g.expires_at,
            "duration_hours": g.duration_hours
        })
    return results

@router.post("/approve")
def approve_consent(data: ConsentApprovalRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    consent = db.query(ConsentRequest).filter(
        ConsentRequest.id == data.request_id,
        ConsentRequest.worker_id == worker.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")

    now = datetime.now(timezone.utc)
    consent.status = "active"
    consent.requested_scopes = json.dumps(data.approved_scopes)
    consent.duration_hours = data.duration_hours
    consent.granted_at = now
    consent.expires_at = now + timedelta(hours=data.duration_hours)

    # Log to audit trail
    doc = consent.doctor
    audit = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=worker.user_id,
        actor_role="worker",
        actor_name=worker.full_name,
        hospital_name=doc.hospital_name if doc else "Hospital",
        action="GRANTED_CONSENT",
        details=f"Authorized {doc.full_name if doc else 'Doctor'} for {data.duration_hours} hours. Scopes: {', '.join(data.approved_scopes)}."
    )
    db.add(audit)
    db.commit()

    return {"message": "Access granted successfully", "expires_at": consent.expires_at}

@router.post("/revoke")
def revoke_consent(data: ConsentRevokeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    
    worker = current_user.worker_profile
    consent = db.query(ConsentRequest).filter(
        ConsentRequest.id == data.request_id,
        ConsentRequest.worker_id == worker.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent request not found")

    consent.status = "revoked"
    consent.revoked_at = datetime.now(timezone.utc)

    # Log audit event
    doc = consent.doctor
    audit = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=worker.user_id,
        actor_role="worker",
        actor_name=worker.full_name,
        hospital_name=doc.hospital_name if doc else "Hospital",
        action="REVOKED_CONSENT",
        details=f"Worker explicitly revoked health record access from {doc.full_name if doc else 'Doctor'}."
    )
    db.add(audit)
    db.commit()

    return {"message": "Access immediately revoked"}
