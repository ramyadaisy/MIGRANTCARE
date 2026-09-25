import pytest
from app.services.ocr_service import ocr_service

def test_ocr_service_entity_extraction():
    sample_text_file = "sample_test_report.txt"
    with open(sample_text_file, "w") as f:
        f.write("""
        METROPOLITAN CLINICAL LABS
        Hemoglobin: 13.5 g/dL
        Fasting Blood Sugar: 95 mg/dL
        Total WBC: 6800 /cumm
        Platelet Count: 2.2 Lakhs/cumm
        Blood Pressure: 118/78 mmHg
        Date: 2026-09-20
        """)
    
    result = ocr_service.extract_text_and_entities(sample_text_file)
    assert "entities" in result
    assert len(result["entities"]) >= 3
    
    # Check that confidence scores are generated between 0.0 and 1.0
    for entity in result["entities"]:
        assert 0.0 <= entity["confidence_score"] <= 1.0
        assert entity["is_verified_by_user"] is False
