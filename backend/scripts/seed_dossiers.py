import os
import json
import uuid
import datetime
from google.cloud import firestore

def seed_dossiers():
    os.environ["GOOGLE_CLOUD_PROJECT"] = "screened-hackathon"
    db = firestore.Client()
    
    dossiers = [
        {
            "id": f"dossier_{uuid.uuid4().hex[:8]}",
            "title": "Raindance Film Festival 2026",
            "status": "COMPLETED",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "transparency_score": 92,
            "summary": "Verified Tier 1 Festival. All claims corroborated via Companies House and UK Charities Commission.",
            "evidence_nodes": [
                {"id": "node_1", "type": "official_domain", "label": "raindance.org", "verified": True},
                {"id": "node_2", "type": "company_registry", "label": "Companies House: 02804551", "verified": True}
            ],
            "fraud_flags": []
        },
        {
            "id": f"dossier_{uuid.uuid4().hex[:8]}",
            "title": "Phantom Indie Awards (SCAM)",
            "status": "COMPLETED",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "transparency_score": 15,
            "summary": "HIGH RISK: Venue does not exist. Organizers untraceable. Multiple complaints on filmmaker forums.",
            "evidence_nodes": [
                {"id": "node_3", "type": "official_domain", "label": "phantomindie.com", "verified": False},
                {"id": "node_4", "type": "physical_venue", "label": "Stated Address (Invalid)", "verified": False}
            ],
            "fraud_flags": ["Phantom Venue", "Ghost Organizers"]
        }
    ]
    
    batch = db.batch()
    for d in dossiers:
        doc_ref = db.collection("dossiers").document(d["id"])
        batch.set(doc_ref, d)
        print(f"Prepared dossier: {d['title']} ({d['id']})")
        
    try:
        batch.commit()
        print("Successfully seeded Golden Dossiers into Firestore.")
    except Exception as e:
        print(f"Failed to seed Firestore (expected if credentials missing): {e}")

if __name__ == "__main__":
    seed_dossiers()
