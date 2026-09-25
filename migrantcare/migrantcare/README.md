# MIGRANTCARE
### “A Portable Digital Health Passport for Migrant Workers”

MigrantCare is a full-stack, production-grade healthcare technology platform built for final-year project presentations, major college hackathons, and healthcare innovation challenges.

---

## 🚀 Quick Start (Running Locally)

### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend (Vite + React)
```bash
cd frontend
npm.cmd run dev
```
- Web Application: `http://localhost:5173`

---

## 👥 Instant Hackathon Demo Accounts (Pre-Seeded)

| Role | Email / ID | Password | Key Demo Feature |
| :--- | :--- | :--- | :--- |
| **Worker** (Arun Kumar) | `arun@migrantcare.org` | `Password123!` | Health ID `MC-2026-001245`, QR Passport, Voice Assist, Prescriptions with Audio Readout, Offline Emergency Card, AI Document Scanner |
| **Doctor** (Dr. Rajesh Kumar) | `dr.rajesh@migrantcare.org` | `Password123!` | Search Health ID, Request 24h OPD Access, View Scoped Timeline, Issue Consultation & Digital Prescription |
| **Hospital Admin** | `hospital@migrantcare.org` | `Password123!` | Victoria Government Hospital OPD Queue & Bed Availability |
| **Public Health Admin** | `admin@migrantcare.org` | `Password123!` | Anonymized Interstate Migration Corridors & Occupational Hazard Prevalence |

---

## 🌟 Hackathon "Wow Moment" Live Presentation Script

1. **Open `http://localhost:5173`**: Log in as **Worker Arun Kumar**.
2. **Switch Language**: Select **Tamil (தமிழ்)** or **Hindi (हिन्दी)** from the top navigation.
3. **Trigger Voice Read Aloud 🔊**: Click "Read Aloud" on Arun's prescription. Notice the natural regional speech audio explaining the dosage schedule.
4. **Display QR Health Passport**: Click **[ Health ID Card ]** to open the cryptographic QR pass. Notice the message: *"Scan only with worker permission"*.
5. **Simulate Interstate Relocation**: Click *"Update Location 📍"* and move Arun from Bengaluru to Chennai. Notice how his health record remains intact.
6. **Open Doctor Portal**: In the top navigation bar, click **"Dr. Rajesh"** under Quick Switch.
7. **Simulate QR Scan / Search**: Look up `MC-2026-001245`. Notice that records are **locked** until consent is granted. Click **[ Request 24-Hour OPD Access ]**.
8. **Worker Consent Flow**: Switch back to **Worker Arun**. Notice the banner: *"Doctor Access Request Pending"*. Click **Review & Authorize**. Check the granular scopes, click **[ Allow Access ]**, and enjoy the celebratory confetti animation!
9. **Doctor Consultation**: Switch back to **Dr. Rajesh**. The records instantly unlock! The doctor sees the penicillin allergy warning and past visits, writes a new consultation, and clicks **[ Submit Consultation ]**.
10. **Continuity & Transparency**: Switch to Worker Arun. The new prescription appears immediately in his timeline. Open **[ Access History ]** to see Dr. Rajesh's audit timestamp and click **[ Revoke Access ]** to immediately cut off authorization.
11. **Offline Emergency Mode**: Click **[ Emergency ]** in the top bar to inspect the high-contrast Red emergency card with 1-tap emergency dialer.

---

## 🧪 Running Automated Tests
```bash
cd backend
python -m pytest tests/
```
All tests verify authentication, role permissions, consent lifecycle, audit trail persistence, and OCR entity extraction.
