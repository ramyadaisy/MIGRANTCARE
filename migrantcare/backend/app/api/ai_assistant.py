from fastapi import APIRouter
from app.schemas.schemas import AIAssistantRequest, AIAssistantResponse
import re

router = APIRouter(prefix="/ai", tags=["MigrantCare AI Health Assistant"])

# Comprehensive medical knowledge base tailored for migrant workers
KNOWLEDGE_BASE = {
    "hemoglobin": {
        "term": "Hemoglobin (Hb)",
        "explanation": "Hemoglobin is the protein in red blood cells that carries oxygen from your lungs to your muscles and organs. Normal range is typically 13 to 17 g/dL for adult men and 12 to 15 g/dL for women. Low hemoglobin causes fatigue, weakness, and dizziness (anemia).",
        "questions": ["Is my hemoglobin level healthy for heavy physical labor?", "Do I need iron supplements or specific dietary changes?"]
    },
    "blood sugar": {
        "term": "Fasting Blood Sugar (FBS)",
        "explanation": "Fasting blood sugar measures glucose in your bloodstream after not eating for 8 to 10 hours. Normal fasting level is between 70 and 100 mg/dL. Values between 100-125 mg/dL suggest prediabetes, and above 126 mg/dL may indicate diabetes.",
        "questions": ["How often should I monitor my blood sugar?", "Should I adjust my daily carbohydrate and sugar intake?"]
    },
    "levocetirizine": {
        "term": "Levocetirizine",
        "explanation": "Levocetirizine is an antihistamine used to relieve allergy symptoms like sneezing, runny nose, watery eyes, and itching caused by construction dust or seasonal allergens. It is usually taken at night because it can cause mild drowsiness.",
        "questions": ["Should I take this only when dust is heavy, or every night?", "Does it interact with any other medications I take?"]
    },
    "salbutamol": {
        "term": "Salbutamol / Albuterol Inhaler",
        "explanation": "Salbutamol is a bronchodilator rescue inhaler that relaxes airway muscles in your lungs, making it easier to breathe during sudden asthma attacks or heavy dust exposure. It works within minutes to relieve wheezing and tight chest.",
        "questions": ["How many puffs should I take during a severe cough?", "How do I know when the inhaler canister is running low?"]
    },
    "tetanus": {
        "term": "Tetanus Toxoid (TT)",
        "explanation": "Tetanus is a serious bacterial infection caused by spores entering through puncture wounds from rusted nails, rebar, or dirty cuts common on construction sites. A booster shot provides strong immunity for up to 5 to 10 years.",
        "questions": ["When is my next tetanus booster due?", "Do I need another injection if I get a deep cut next week?"]
    },
    "bp": {
        "term": "Blood Pressure (BP)",
        "explanation": "Blood pressure measures the pressure of circulating blood against the walls of blood vessels. 120/80 mmHg is normal. The top number (systolic) measures heart pumping pressure, and the bottom number (diastolic) measures resting pressure between beats.",
        "questions": ["Is my blood pressure safe for high-temperature work shifts?", "Should I reduce salt intake or check my BP regularly?"]
    },
    "dust": {
        "term": "Construction Dust & Silica Protection",
        "explanation": "Inhaling cement and silica dust over months can irritate bronchial tubes and lead to chronic lung inflammation. Wearing a certified N95 or well-fitted dust mask, drinking plenty of water, and washing work clothes regularly provides vital lung protection.",
        "questions": ["Can the clinic perform a pulmonary peak flow test?", "What are early symptoms of lung dust irritation I should watch for?"]
    }
}

EMERGENCY_KEYWORDS = ["chest pain", "heart attack", "unconscious", "cannot breathe", "severe bleeding", "paralysis", "stroke", "poison"]

@router.post("/query", response_model=AIAssistantResponse)
def query_ai_assistant(req: AIAssistantRequest):
    q_lower = req.query.lower()
    
    # Check for emergency red alert condition
    for kw in EMERGENCY_KEYWORDS:
        if kw in q_lower:
            return AIAssistantResponse(
                reply="⚠️ URGENT EMERGENCY ALERT: Your symptoms may indicate a critical medical condition requiring immediate in-person attention. Please do not wait. Go immediately to the nearest Emergency Room or call national emergency services (108 / 112).",
                explanation="Emergency triage triggered. This platform cannot treat acute emergencies.",
                safety_disclaimer="MigrantCare AI does not provide emergency triage. Seek immediate emergency care.",
                suggested_questions_for_doctor=["Where is the nearest 24/7 trauma or cardiac care emergency room?"]
            )

    # Check knowledge base
    matched_term = None
    for key, data in KNOWLEDGE_BASE.items():
        if key in q_lower:
            matched_term = data
            break

    if matched_term:
        # Contextual response
        reply = f"Here is an explanation of **{matched_term['term']}**:\n\n{matched_term['explanation']}"
        return AIAssistantResponse(
            reply=reply,
            explanation=matched_term['explanation'],
            suggested_questions_for_doctor=matched_term['questions']
        )

    # General supportive answer with educational orientation
    general_reply = (
        f"Thank you for asking about '{req.query}'. "
        "As your MigrantCare AI assistant, I can explain medical terms, lab report values, prescription directions, "
        "and occupational safety guidelines for migrant workers. "
        "To get specific details, you can ask questions like: 'What is Hemoglobin?', 'How does Levocetirizine work?', "
        "'Explain Blood Pressure numbers', or 'How to protect lungs from cement dust?'."
    )

    return AIAssistantResponse(
        reply=general_reply,
        explanation="General health education guidance.",
        suggested_questions_for_doctor=[
            "Can you explain my recent lab report in simple words?",
            "How long do I need to continue my current prescription?",
            "Are there any side effects I should watch out for on work shifts?"
        ]
    )
