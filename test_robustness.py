import requests
import json

# API Endpoint
URL = "http://localhost:8000/predict"

# Test cases with typos, slang, and weird phrasing
test_cases = [
    "i hav a headdache",             # Typos
    "my tumy hurts bad",             # Slang/Typos
    "feeeeling very hot and cold",   # Char repetition
    "chest pain",                    # Direct
    "i ate a shoe",                  # Nonsense (Should be low confidence)
    "hello doctor",                  # Non-medical
    "cant brethe properly",          # Typos
    "skin is itchy and red"          # Description
]

def test_api():
    print(f"{'INPUT':<30} | {'PREDICTION':<20} | {'CONFIDENCE'}")
    print("-" * 65)
    
    for text in test_cases:
        try:
            payload = {"text": text}
            response = requests.post(URL, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                pred = data['normalized_symptom']
                conf = data['confidence']
                
                # Truncate for display
                if len(pred) > 20: pred = pred[:17] + "..."
                
                print(f"{text:<30} | {pred:<20} | {conf:.2f}")
            else:
                print(f"{text:<30} | Error: {response.status_code}")
                
        except Exception as e:
            print(f"Error connecting to API: {e}")
            print("Make sure main.py is running!")
            return

if __name__ == "__main__":
    test_api()
