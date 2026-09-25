from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.database import get_db
from app.db.models import HealthcareFacility

router = APIRouter(prefix="/facilities", tags=["Healthcare Facilities Directory"])

@router.get("/")
def get_facilities(
    city: Optional[str] = Query(None),
    facility_type: Optional[str] = Query(None),
    emergency_only: Optional[bool] = Query(False),
    free_opd_only: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(HealthcareFacility)

    if city and city != "All":
        query = query.filter(HealthcareFacility.city.ilike(f"%{city}%"))
    if facility_type and facility_type != "All":
        query = query.filter(HealthcareFacility.facility_type.ilike(f"%{facility_type}%"))
    if emergency_only:
        query = query.filter(HealthcareFacility.emergency_available == True)
    if free_opd_only:
        query = query.filter(HealthcareFacility.has_free_opd == True)

    facilities = query.all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "facility_type": f.facility_type,
            "city": f.city,
            "state": f.state,
            "address": f.address,
            "phone": f.phone,
            "emergency_available": f.emergency_available,
            "has_free_opd": f.has_free_opd,
            "latitude": f.latitude,
            "longitude": f.longitude
        } for f in facilities
    ]

@router.get("/cities")
def get_facility_cities(db: Session = Depends(get_db)):
    cities = db.query(HealthcareFacility.city).distinct().all()
    return [c[0] for c in cities if c[0]]
