from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.db.database import get_db
from app.db.models import (
    User, Worker, EmergencyProfile, OccupationalProfile,
    Vaccination, HealthScreening, MedicationReminder, AccessAuditLog, Notification
)
from app.api.auth import get_current_user
from app.schemas.schemas import HealthScreeningCreate

router = APIRouter(prefix="/worker", tags=["Worker Services"])

def get_current_worker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Worker:
    if current_user.role != "worker" or not current_user.worker_profile:
        raise HTTPException(status_code=403, detail="Worker access required")
    return current_user.worker_profile

@router.get("/profile")
def get_worker_profile(worker: Worker = Depends(get_current_worker)):
    ep = worker.emergency_profile
    op = worker.occupational_profile
    return {
        "id": worker.id,
        "health_id": worker.health_id,
        "full_name": worker.full_name,
        "date_of_birth": worker.date_of_birth,
        "gender": worker.gender,
        "blood_group": worker.blood_group,
        "phone": worker.phone,
        "home_state": worker.home_state,
        "current_state": worker.current_state,
        "current_city": worker.current_city,
        "preferred_language": worker.preferred_language,
        "emergency_profile": {
            "critical_allergies": ep.critical_allergies if ep else "None",
            "chronic_conditions": ep.chronic_conditions if ep else "None",
            "blood_group": ep.blood_group if ep else worker.blood_group,
            "emergency_contact_name": ep.emergency_contact_name if ep else "",
            "emergency_contact_relation": ep.emergency_contact_relation if ep else "",
            "emergency_contact_phone": ep.emergency_contact_phone if ep else "",
            "organ_donor": ep.organ_donor if ep else False,
            "special_instructions": ep.special_instructions if ep else ""
        } if ep else None,
        "occupational_profile": {
            "primary_industry": op.primary_industry if op else "Construction",
            "current_workplace": op.current_workplace if op else "",
            "years_in_field": op.years_in_field if op else 1,
            "hazard_exposures": json.loads(op.hazard_exposures) if op and op.hazard_exposures else []
        } if op else None
    }

@router.put("/profile/language")
def update_preferred_language(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    lang = data.get("language", "ta")
    worker.preferred_language = lang
    db.commit()
    return {"message": "Language updated", "language": lang}

@router.put("/profile/migration")
def update_migration_location(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    new_city = data.get("current_city")
    new_state = data.get("current_state")
    if new_city:
        worker.current_city = new_city
    if new_state:
        worker.current_state = new_state
    
    # Log audit event
    audit = AccessAuditLog(
        worker_id=worker.id,
        actor_user_id=worker.user_id,
        actor_role="worker",
        actor_name=worker.full_name,
        hospital_name="Self-Service Portal",
        action="UPDATED_MIGRATION_LOCATION",
        details=f"Updated migration destination to {worker.current_city}, {worker.current_state}."
    )
    db.add(audit)
    db.commit()
    return {"message": "Location updated", "city": worker.current_city, "state": worker.current_state}

@router.get("/emergency-card")
def get_emergency_card(health_id: str, db: Session = Depends(get_db)):
    """Public emergency lookup without sensitive medical history."""
    worker = db.query(Worker).filter(Worker.health_id == health_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Health ID not found")
    
    ep = worker.emergency_profile
    return {
        "health_id": worker.health_id,
        "full_name": worker.full_name,
        "blood_group": worker.blood_group,
        "gender": worker.gender,
        "critical_allergies": ep.critical_allergies if ep else "None reported",
        "chronic_conditions": ep.chronic_conditions if ep else "None reported",
        "emergency_contact_name": ep.emergency_contact_name if ep else "Emergency Contact",
        "emergency_contact_relation": ep.emergency_contact_relation if ep else "Relative",
        "emergency_contact_phone": ep.emergency_contact_phone if ep else "",
        "special_instructions": ep.special_instructions if ep else "Do not administer penicillin unless verified."
    }

@router.get("/vaccinations")
def get_vaccinations(worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    return db.query(Vaccination).filter(Vaccination.worker_id == worker.id).order_by(Vaccination.administered_date.desc()).all()

@router.get("/screenings")
def get_screenings(worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    return db.query(HealthScreening).filter(HealthScreening.worker_id == worker.id).order_by(HealthScreening.screening_date.asc()).all()

@router.post("/screenings")
def add_screening(data: HealthScreeningCreate, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    # Calculate BMI
    bmi = round(data.weight_kg / ((data.height_cm / 100) ** 2), 1) if data.height_cm > 0 else 22.0
    screening = HealthScreening(
        worker_id=worker.id,
        screening_date=datetime.now().strftime("%Y-%m-%d"),
        systolic_bp=data.systolic_bp,
        diastolic_bp=data.diastolic_bp,
        pulse_rate=data.pulse_rate,
        blood_glucose=data.blood_glucose,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
        bmi=bmi,
        respiratory_symptom_flag=data.respiratory_symptom_flag,
        musculoskeletal_flag=data.musculoskeletal_flag,
        hearing_screen_flag=data.hearing_screen_flag
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    return screening

@router.get("/reminders")
def get_reminders(worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    return db.query(MedicationReminder).filter(MedicationReminder.worker_id == worker.id).all()

@router.post("/reminders")
def add_reminder(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    reminder = MedicationReminder(
        worker_id=worker.id,
        medication_name=data.get("medication_name", "Medicine"),
        dosage=data.get("dosage", "1 dose"),
        reminder_time=data.get("reminder_time", "08:00"),
        timing_label=data.get("timing_label", "After Breakfast"),
        is_active=True
    )
    db.add(reminder)
    db.commit()
    return reminder

@router.get("/notifications")
def get_notifications(worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == worker.user_id).order_by(Notification.created_at.desc()).all()

@router.get("/audit-logs")
def get_audit_logs(worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    """Who viewed my health information?"""
    return db.query(AccessAuditLog).filter(AccessAuditLog.worker_id == worker.id).order_by(AccessAuditLog.timestamp.desc()).all()

@router.put("/emergency-profile")
def update_emergency_profile(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    ep = worker.emergency_profile
    if not ep:
        ep = EmergencyProfile(worker_id=worker.id)
        db.add(ep)
    
    if "critical_allergies" in data:
        ep.critical_allergies = data["critical_allergies"]
    if "chronic_conditions" in data:
        ep.chronic_conditions = data["chronic_conditions"]
    if "blood_group" in data:
        ep.blood_group = data["blood_group"]
        worker.blood_group = data["blood_group"]
    if "emergency_contact_name" in data:
        ep.emergency_contact_name = data["emergency_contact_name"]
    if "emergency_contact_relation" in data:
        ep.emergency_contact_relation = data["emergency_contact_relation"]
    if "emergency_contact_phone" in data:
        ep.emergency_contact_phone = data["emergency_contact_phone"]
    if "special_instructions" in data:
        ep.special_instructions = data["special_instructions"]
    
    db.commit()
    return {"message": "Emergency profile updated successfully"}

@router.post("/vaccinations")
def add_vaccination(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    vac = Vaccination(
        worker_id=worker.id,
        vaccine_name=data.get("vaccine_name", "Tetanus Toxoid"),
        dose_number=data.get("dose_number", "Dose 1"),
        administered_date=data.get("administered_date", datetime.now().strftime("%Y-%m-%d")),
        batch_number=data.get("batch_number", "VAC-MANUAL"),
        administered_facility=data.get("administered_facility", "Clinic"),
        next_due_date=data.get("next_due_date")
    )
    db.add(vac)
    db.commit()
    db.refresh(vac)
    return vac

@router.put("/occupational")
def update_occupational_profile(data: dict, worker: Worker = Depends(get_current_worker), db: Session = Depends(get_db)):
    op = worker.occupational_profile
    if not op:
        op = OccupationalProfile(worker_id=worker.id)
        db.add(op)
    
    if "primary_industry" in data:
        op.primary_industry = data["primary_industry"]
    if "current_workplace" in data:
        op.current_workplace = data["current_workplace"]
    if "years_in_field" in data:
        op.years_in_field = int(data["years_in_field"])
    if "hazard_exposures" in data:
        op.hazard_exposures = json.dumps(data["hazard_exposures"])
    
    db.commit()
    return {"message": "Occupational profile updated successfully"}

