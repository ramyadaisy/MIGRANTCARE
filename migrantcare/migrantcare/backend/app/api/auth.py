from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
import random

from app.db.database import get_db
from app.db.models import User, Worker, Doctor, Hospital, EmergencyProfile, OccupationalProfile
from app.schemas.schemas import Token, LoginRequest, UserCreate
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_or_phone == login_data.email_or_phone).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid phone/email or password")
    
    health_id = None
    doctor_code = None
    full_name = "User"
    
    if user.role == "worker" and user.worker_profile:
        health_id = user.worker_profile.health_id
        full_name = user.worker_profile.full_name
    elif user.role == "doctor" and user.doctor_profile:
        doctor_code = user.doctor_profile.doctor_code
        full_name = user.doctor_profile.full_name
    elif user.role == "hospital" and user.hospital_profile:
        full_name = user.hospital_profile.hospital_name
    elif user.role == "admin":
        full_name = "System Administrator"

    access_token = create_access_token(
        data={"sub": user.email_or_phone, "role": user.role, "user_id": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": full_name,
        "health_id": health_id,
        "doctor_code": doctor_code
    }

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email_or_phone == user_in.email_or_phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email/phone already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email_or_phone=user_in.email_or_phone,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(user)
    db.flush()

    health_id = None
    doctor_code = None

    if user_in.role == "worker":
        # Generate format MC-YYYY-XXXXXX
        health_id = f"MC-2026-{random.randint(100000, 999999)}"
        worker = Worker(
            user_id=user.id,
            health_id=health_id,
            full_name=user_in.full_name,
            phone=user_in.phone,
            home_state=user_in.home_state or "Tamil Nadu",
            current_state=user_in.current_state or "Karnataka",
            current_city=user_in.current_city or "Bengaluru",
            blood_group=user_in.blood_group or "O+",
            preferred_language=user_in.preferred_language or "ta"
        )
        db.add(worker)
        db.flush()
        
        # Initialize default emergency profile
        ep = EmergencyProfile(
            worker_id=worker.id,
            critical_allergies="None specified",
            chronic_conditions="None specified",
            blood_group=user_in.blood_group or "O+",
            emergency_contact_name="Family Contact",
            emergency_contact_relation="Family",
            emergency_contact_phone=user_in.phone
        )
        db.add(ep)
        
        # Initialize default occupational profile
        op = OccupationalProfile(
            worker_id=worker.id,
            primary_industry="Construction",
            current_workplace=f"{user_in.current_city} Site",
            years_in_field=2,
            hazard_exposures='["Dust Exposure", "Physical Strain"]'
        )
        db.add(op)

    elif user_in.role == "doctor":
        doctor_code = f"DOC-{random.randint(1000, 9999)}"
        doctor = Doctor(
            user_id=user.id,
            doctor_code=doctor_code,
            full_name=user_in.full_name,
            specialization=user_in.specialization or "General Medicine",
            registration_number=user_in.registration_number or f"REG-{random.randint(10000, 99999)}",
            hospital_name=user_in.hospital_name or "General Hospital",
            city=user_in.current_city or "Bengaluru",
            state=user_in.current_state or "Karnataka"
        )
        db.add(doctor)

    db.commit()

    access_token = create_access_token(
        data={"sub": user.email_or_phone, "role": user.role, "user_id": user.id}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user_in.full_name,
        "health_id": health_id,
        "doctor_code": doctor_code
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    profile_info = {}
    if current_user.role == "worker" and current_user.worker_profile:
        w = current_user.worker_profile
        profile_info = {
            "health_id": w.health_id,
            "full_name": w.full_name,
            "blood_group": w.blood_group,
            "preferred_language": w.preferred_language,
            "home_state": w.home_state,
            "current_state": w.current_state,
            "current_city": w.current_city
        }
    elif current_user.role == "doctor" and current_user.doctor_profile:
        d = current_user.doctor_profile
        profile_info = {
            "doctor_code": d.doctor_code,
            "full_name": d.full_name,
            "specialization": d.specialization,
            "hospital_name": d.hospital_name,
            "city": d.city
        }
    return {
        "id": current_user.id,
        "email_or_phone": current_user.email_or_phone,
        "role": current_user.role,
        "profile": profile_info
    }
