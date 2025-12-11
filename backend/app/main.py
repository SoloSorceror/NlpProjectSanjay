from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification

# Global variables to hold model and artifacts
model = None
tokenizer = None
label_map = None

# Configuration (must match training)
MAX_LENGTH = 64

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer, label_map
    try:
        # Use relative pathing based on this file's location
        current_dir = os.path.dirname(os.path.abspath(__file__)) # .../backend/app
        backend_dir = os.path.dirname(current_dir) # .../backend
        base_path = os.path.join(backend_dir, "nlp")
        
        # Load Model and Tokenizer (from 'bert_model' directory)
        model_path = os.path.join(base_path, "bert_model")
        print(f"Loading DistilBERT model from {model_path}...")
        
        if os.path.exists(model_path):
            tokenizer = DistilBertTokenizer.from_pretrained(model_path)
            model = TFDistilBertForSequenceClassification.from_pretrained(model_path)
            print("Model and tokenizer loaded successfully.")
        else:
            print(f"Warning: Model path {model_path} does not exist. Model not loaded.")
        
        # Load Label Map
        label_map_path = os.path.join(base_path, "label_map.json")
        if os.path.exists(label_map_path):
            with open(label_map_path, 'r') as f:
                label_map = json.load(f)
                # Convert keys to int (json loads keys as strings)
                label_map = {int(k): v for k, v in label_map.items()}
            print(f"Label map loaded from {label_map_path}")
        else:
             print(f"Warning: Label map path {label_map_path} does not exist.")
        
    except Exception as e:
        print(f"Error loading artifacts: {e}")
        # In production, we might want to crash if model fails to load
        pass
    
    yield
    
    # Clean up resources if needed
    model = None
    tokenizer = None
    label_map = None

app = FastAPI(title="Telemedicine Symptom Normalizer", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomRequest(BaseModel):
    text: str

class SymptomResponse(BaseModel):
    normalized_symptom: str
    confidence: float

@app.post("/predict", response_model=SymptomResponse)
async def predict_symptom(request: SymptomRequest):
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Preprocess (Tokenization)
    encodings = tokenizer(
        [request.text], 
        truncation=True, 
        padding=True, 
        max_length=MAX_LENGTH, 
        return_tensors='tf'
    )
    
    # Predict
    logits = model(encodings).logits
    probabilities = tf.nn.softmax(logits, axis=1)
    
    predicted_index = int(tf.argmax(probabilities, axis=1)[0])
    confidence = float(np.max(probabilities))
    
    normalized_symptom = label_map.get(predicted_index, "Unknown")
    
    # Relevance Check
    # 1. Low confidence check (e.g., input is gibberish or unknown words)
    # 2. explicit "Non-Medical" class check
    if confidence < 0.6 or normalized_symptom == "Non-Medical":
        normalized_symptom = "I am sorry, I am not able to figure out your query is it a medical related query?"
        
        # Feedback Loop: Log low confidence queries
        if confidence < 0.6:
            # logs go to backend/low_confidence_logs.txt
            try:
                log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "low_confidence_logs.txt")
                with open(log_path, "a") as f:
                    f.write(f"{request.text} | {confidence}\n")
            except Exception as e:
                print(f"Failed to log low confidence query: {e}")
    
    return SymptomResponse(
        normalized_symptom=normalized_symptom,
        confidence=confidence
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
