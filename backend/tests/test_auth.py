import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_worker_login():
    response = client.post("/api/auth/login", json={
        "email_or_phone": "arun@migrantcare.org",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "worker"
    assert data["health_id"] == "MC-2026-001245"
    assert "access_token" in data

def test_doctor_login():
    response = client.post("/api/auth/login", json={
        "email_or_phone": "dr.rajesh@migrantcare.org",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "doctor"
    assert data["doctor_code"] == "DOC-9842"
    assert "access_token" in data

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "email_or_phone": "arun@migrantcare.org",
        "password": "WrongPassword!"
    })
    assert response.status_code == 400

def test_manual_worker_registration():
    import random
    unique_phone = f"98{random.randint(10000000, 99999999)}"
    reg_data = {
        "email_or_phone": unique_phone,
        "password": "SecureWorkerPassword123!",
        "role": "worker",
        "full_name": "Ramesh Chandra",
        "phone": unique_phone,
        "date_of_birth": "1994-08-15",
        "gender": "Male",
        "blood_group": "B+",
        "home_state": "Bihar",
        "home_district": "Madhubani",
        "current_state": "Maharashtra",
        "current_city": "Pune",
        "preferred_language": "hi",
        "critical_allergies": "Sulfa Antibiotics",
        "chronic_conditions": "Hypertension Stage 1",
        "emergency_contact_name": "Suresh Chandra",
        "emergency_contact_relation": "Brother",
        "emergency_contact_phone": "+91 91234 56789",
        "organ_donor": True,
        "special_instructions": "Check blood pressure before anesthesia",
        "primary_industry": "Manufacturing",
        "current_workplace": "Auto Parts Plant, Chakan",
        "years_in_field": 4
    }
    response = client.post("/api/auth/register", json=reg_data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["role"] == "worker"
    assert res_json["full_name"] == "Ramesh Chandra"
    assert res_json["health_id"].startswith("MC-2026-")
    token = res_json["access_token"]
    
    # Verify profile endpoint returns exactly what was manually inserted
    prof_res = client.get("/api/worker/profile", headers={"Authorization": f"Bearer {token}"})
    assert prof_res.status_code == 200
    profile = prof_res.json()
    assert profile["full_name"] == "Ramesh Chandra"
    assert profile["blood_group"] == "B+"
    assert profile["date_of_birth"] == "1994-08-15"
    assert profile["gender"] == "Male"
    assert profile["home_state"] == "Bihar"
    assert profile["current_city"] == "Pune"
    assert profile["emergency_profile"]["critical_allergies"] == "Sulfa Antibiotics"
    assert profile["emergency_profile"]["chronic_conditions"] == "Hypertension Stage 1"
    assert profile["emergency_profile"]["emergency_contact_name"] == "Suresh Chandra"
    assert profile["occupational_profile"]["primary_industry"] == "Manufacturing"

