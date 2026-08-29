import os
import datetime
from google.cloud import firestore

# Using the unified runtime demo payload generator
from backend.demo_payloads import get_demo_full_dossier, DEMO_INVESTIGATION_ID

def seed_dossiers():
    os.environ["GOOGLE_CLOUD_PROJECT"] = "screened-hackathon"
    db = firestore.Client()
    
    # We now seed the single "Gold Standard" Pinco Pallino Demo Dossier
    # directly from the application's runtime demo payload to ensure consistency.
    dossier_data = get_demo_full_dossier()
    
    batch = db.batch()
    
    # Write the investigation document
    doc_ref = db.collection("investigations").document(DEMO_INVESTIGATION_ID)
    batch.set(doc_ref, dossier_data)
    
    print(f"Prepared Golden Dossier: {dossier_data['query']} ({DEMO_INVESTIGATION_ID})")
        
    try:
        batch.commit()
        print("Successfully seeded Golden Dossiers into Firestore.")
    except Exception as e:
        print(f"Failed to seed Firestore (expected if credentials missing or emulator offline): {e}")

if __name__ == "__main__":
    seed_dossiers()
