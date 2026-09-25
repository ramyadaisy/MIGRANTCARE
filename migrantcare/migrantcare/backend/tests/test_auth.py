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
