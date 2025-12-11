import requests
import os
import time

def verify_backend():
    base_url = "http://localhost:8000"
    
    print("1. Testing Complex Query...")
    try:
        payload = {"text": "I have been dealing with Headache for a week"}
        response = requests.post(f"{base_url}/predict", json=payload)
        data = response.json()
        print(f"Response: {data}")
        if data['normalized_symptom'] == "Headache" and data['confidence'] > 0.8:
            print("✅ Complex query handled correctly.")
        else:
            print(f"❌ Complex query failed. Got {data['normalized_symptom']} with confidence {data['confidence']}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

    print("\n2. Testing Feedback Loop (Low Confidence)...")
    try:
        nonsense_text = "I have glioblastoma" # OOV word, should confuse model
        payload = {"text": nonsense_text}
        response = requests.post(f"{base_url}/predict", json=payload)
        data = response.json()
        print(f"Response: {data}")
        
        # Check logs (uvicorn is running in /backend)
        log_file = os.path.join("backend", "low_confidence_logs.txt")
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                logs = f.read()
                if nonsense_text in logs:
                     print("✅ Feedback loop verified. Nonsense text found in logs.")
                else:
                     print("❌ Feedback loop failed. Nonsense text NOT found in logs.")
        else:
             print(f"❌ Log file does not exist at {log_file}.")
             
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    # Give uvicorn a moment to settle if it just reloaded
    time.sleep(2)
    verify_backend()
