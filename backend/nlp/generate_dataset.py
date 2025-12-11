import pandas as pd
import random
import os

# Standard Symptoms Dictionary
# Maps a standard medical term to a list of colloquial/user phrases
# Standard Symptoms Dictionary
# Maps a standard medical term to a list of colloquial/user phrases
SYMPTOM_MAP = {
    "Headache": [
        "head hurts", "pounding head", "migraine", "headache", "my head is killing me",
        "throbbing in my head", "pain in my skull", "splitting headache", "dizzy head"
    ],
    "Fever": [
        "high temp", "fever", "burning up", "feeling hot", "chills", "temperature is high",
        "shivering", "hot forehead", "feverish"
    ],
    "Nausea": [
        "feel sick", "want to vomit", "nausea", "queasy", "stomach upset", "feel like throwing up",
        "sick to my stomach", "urge to vomit"
    ],
    "Cough": [
        "coughing", "dry cough", "hacking cough", "coughing up phlegm", "bad cough",
        "can't stop coughing", "tickle in throat"
    ],
    "Fatigue": [
        "tired", "exhausted", "no energy", "worn out", "fatigue", "feeling weak",
        "drained", "sleepy all the time", "lethargic"
    ],
    "Sore Throat": [
        "throat hurts", "pain when swallowing", "sore throat", "scratchy throat",
        "throat is raw", "burning throat "
    ],
    "Shortness of Breath": [
        "can't breathe", "short of breath", "hard to breathe", "gasping for air",
        "breathless", "winded easily", "chest feels tight"
    ],
    "Joint Pain": [
        "knees hurt", "elbows ache", "joint pain", "stiff joints", "aching bones",
        "pain in my joints", "arthritis pain"
    ],
    "Skin Rash": [
        "itchy skin", "red spots", "rash", "hives", "skin breakout", "itchy bumps",
        "redness on skin"
    ],
    "Abdominal Pain": [
        "stomach ache", "belly pain", "abdominal pain", "tummy hurts", "cramps",
        "pain in my gut", "stomach cramps"
    ],
    "Back Pain": [
        "back hurts", "lower back pain", "spine hurts", "stiff back", "backache",
        "pain in my back", "pulled a muscle in my back"
    ],
    "Chest Pain": [
        "chest hurts", "pain in chest", "tight chest", "pressure in chest", "heart hurts",
        "sharp pain in chest"
    ],
    "Dizziness": [
        "dizzy", "lightheaded", "room is spinning", "vertigo", "feeling faint",
        "unsteady"
    ],
    "Insomnia": [
        "can't sleep", "trouble sleeping", "staying awake", "insomnia", "haven't slept",
        "tossing and turning"
    ],
    "Anxiety": [
        "anxious", "nervous", "panicking", "panic attack", "worried sick", "stress",
        "feeling efficient"
    ],
    "Depression": [
        "feeling sad", "depressed", "no motivation", "feeling down", "hopeless",
        "crying a lot"
    ],
    "Earache": [
        "ear hurts", "pain in ear", "earache", "blocked ear", "ringing in ears"
    ],
    "Eye Pain": [
        "eye hurts", "pain in eye", "blurry vision", "itchy eyes", "red eyes",
        "vision problems"
    ],
    "Toothache": [
        "tooth hurts", "toothache", "pain in tooth", "sensitive teeth", "gum pain"
    ],
    "Acne": [
        "pimples", "zits", "acne", "breakouts", "spots on face"
    ],
    "Allergies": [
        "sneezing", "runny nose", "allergies", "hay fever", "allergic reaction"
    ],
    "Diarrhea": [
        "runny tummy", "diarrhea", "loose stools", "upset stomach", "frequent bathroom trips"
    ],
    "Constipation": [
        "constipated", "can't poop", "hard stool", "backed up", "constipation"
    ],
    "Burn": [
        "burned myself", "skin burn", "sunburn", "touched something hot", "minor burn"
    ],
    "Cut": [
        "cut my finger", "bleeding", "cut myself", "scratch", "wound"
    ],
    "Non-Medical": [
        "hello", "hi there", "how are you", "good morning", "what is your name",
        "tell me a joke", "i like pizza", "what is the weather", "who are you",
        "do you like cars", "i am happy", "goodbye", "thanks", "thank you",
        "cool", "nice", "okay", "random text", "testing"
    ]
}

# Templates to add variety
TEMPLATES = [
    "{symptom}",
    "I have {symptom}",
    "I am experiencing {symptom}",
    "I've been having {symptom}",
    "Suffering from {symptom}",
    "My problem is {symptom}",
    "It feels like {symptom}",
    "Lately I have {symptom}",
    "Complaining of {symptom}",
    "Dealing with {symptom}",
    "Severe {symptom}",
    "Mild {symptom}",
    "Chronic {symptom}",
    "Sudden {symptom}",
    "Help, I have {symptom}",
    "Doctor, I have {symptom}",
    "Can you help with {symptom}?",
    "I think I have {symptom}",
    "It started as a {symptom} but now it's worse",
    "Do you think {symptom} is serious?",
    "Suffering from {symptom} for 3 days",
    "I have been dealing with {symptom} for a week",
    "Is {symptom} something to worry about?",
    "My {symptom} is getting unbearable",
    "I woke up with {symptom}",
    "Constant {symptom} keeps me awake",
    "I can't shake this {symptom}",
    "Not sure if it is {symptom} or something else",
    "Feeling of {symptom} throughout the day",
    "Recurring {symptom} every morning",
    "Painful {symptom} on my left side",
    "Please tell me what to do about {symptom}"
]

def add_typo(text):
    # 30% chance to introduce a typo
    if random.random() > 0.3:
        return text
        
    chars = list(text)
    if len(chars) < 4: return text # Don't mess up short words
    
    # Randomly swap two adjacent characters (common typing error)
    idx = random.randint(0, len(chars) - 2)
    chars[idx], chars[idx+1] = chars[idx+1], chars[idx]
    
    return "".join(chars)

def generate_dataset(num_samples=20000):
    data = []
    symptoms = [s.strip() for s in SYMPTOM_MAP.keys()]
    
    print(f"Generating {num_samples} samples...")
    
    for _ in range(num_samples):
        # Pick a random standard symptom
        standard_symptom = random.choice(symptoms)
        
        # Pick a random colloquial phrase for that symptom
        user_phrase = random.choice(SYMPTOM_MAP[standard_symptom])
        
        # Pick a random template
        template = random.choice(TEMPLATES)
        
        # Construct the text
        text = template.format(symptom=user_phrase)
        
        # Apply typo noise
        text = add_typo(text)
        
        # Add some random noise/variation (optional but good for robustness)
        if random.random() < 0.1:
            text = text.lower()
        if random.random() < 0.05:
            text = text.upper()
            
        data.append({
            "text": text,
            "label": standard_symptom
        })
        
    df = pd.DataFrame(data)
    
    # Shuffle the dataset
    df = df.sample(frac=1).reset_index(drop=True)
    
    output_path = os.path.join("backend", "nlp", "dataset.csv")
    df.to_csv(output_path, index=False)
    print(f"Dataset saved to {output_path}")
    print(df.head())
    print(df['label'].value_counts())

if __name__ == "__main__":
    generate_dataset()
