import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_consent_and_audit_flow():
    # 1. Login as Doctor
    doc_res = client.post("/api/auth/login", json={
        "email_or_phone": "dr.rajesh@migrantcare.org",
        "password": "Password123!"
    })
    assert doc_res.status_code == 200
    doc_token = doc_res.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # 2. Login as Worker
    worker_res = client.post("/api/auth/login", json={
        "email_or_phone": "arun@migrantcare.org",
        "password": "Password123!"
    })
    assert worker_res.status_code == 200
    worker_token = worker_res.json()["access_token"]
    worker_headers = {"Authorization": f"Bearer {worker_token}"}

    # 2.5 Ensure any prior active grants are revoked for idempotent test execution
    active_grants = client.get("/api/consent/active-grants", headers=worker_headers).json()
    for grant in active_grants:
        client.post("/api/consent/revoke", json={"request_id": grant["id"]}, headers=worker_headers)

    # 3. Doctor searches worker
    search_res = client.get("/api/doctor/search-worker/MC-2026-001245", headers=doc_headers)
    assert search_res.status_code == 200
    assert search_res.json()["full_name"] == "Arun Kumar"

    # 4. Doctor requests access
    req_res = client.post("/api/consent/request", json={
        "worker_health_id": "MC-2026-001245",
        "requested_scopes": ["medical_history", "prescriptions"],
        "duration_hours": 12
    }, headers=doc_headers)
    assert req_res.status_code == 200
    assert req_res.json()["status"] == "pending"
    consent_id = req_res.json().get("consent_id")

    # 5. Worker checks pending requests
    pending_res = client.get("/api/consent/pending", headers=worker_headers)
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert len(pending_list) >= 1

    # 6. Worker approves consent
    approve_res = client.post("/api/consent/approve", json={
        "request_id": pending_list[0]["id"],
        "approved_scopes": ["medical_history", "prescriptions"],
        "duration_hours": 12
    }, headers=worker_headers)
    assert approve_res.status_code == 200

    # 7. Doctor views patient records under active authorization
    view_res = client.get("/api/records/doctor-view/MC-2026-001245", headers=doc_headers)
    assert view_res.status_code == 200
    data = view_res.json()
    assert "timeline" in data
    assert "prescriptions" in data

    # 8. Worker verifies audit log exists
    audit_res = client.get("/api/worker/audit-logs", headers=worker_headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1
