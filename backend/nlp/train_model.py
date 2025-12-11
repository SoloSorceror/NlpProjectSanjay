import pandas as pd
import numpy as np
import os
import json
import shutil
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import tensorflow as tf
from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification

# Configuration
MAX_LENGTH = 64
BATCH_SIZE = 16
EPOCHS = 3
MODEL_NAME = 'distilbert-base-uncased'

def train_model():
    print("Loading dataset...")
    dataset_path = os.path.join("backend", "nlp", "dataset.csv")
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    df = pd.read_csv(dataset_path)
    
    # Ensure text columns are strings
    sentences = df['text'].astype(str).tolist()
    labels = df['label'].tolist()
    
    # Encode labels
    le = LabelEncoder()
    labels_final = le.fit_transform(labels)
    num_classes = len(np.unique(labels_final))
    
    # Save label encoder classes
    label_map_path = os.path.join("backend", "nlp", "label_map.json")
    label_map = {int(index): label for index, label in enumerate(le.classes_)}
    with open(label_map_path, 'w') as f:
        json.dump(label_map, f)
    print(f"Label map saved to {label_map_path}")
        
    # Split data
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        sentences, labels_final, test_size=0.2, random_state=42
    )
    
    # Tokenization
    print(f"Tokenizing data using {MODEL_NAME}...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    
    train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=MAX_LENGTH)
    val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=MAX_LENGTH)
    
    # Create TensorFlow Datasets
    train_dataset = tf.data.Dataset.from_tensor_slices((
        dict(train_encodings),
        train_labels
    )).shuffle(1000).batch(BATCH_SIZE)
    
    val_dataset = tf.data.Dataset.from_tensor_slices((
        dict(val_encodings),
        val_labels
    )).batch(BATCH_SIZE)
    
    # Model Setup
    print("Building DistilBERT model...")
    # use_safetensors=False is critical on some Windows/TF setups to avoid 'safe_open' errors
    model = TFDistilBertForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=num_classes, use_safetensors=False)
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)
    loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    metric = tf.keras.metrics.SparseCategoricalAccuracy('accuracy')
    
    model.compile(optimizer=optimizer, loss=loss, metrics=[metric])
    
    # Training
    print("Starting training...")
    model.fit(train_dataset, epochs=EPOCHS, validation_data=val_dataset)
    
    # Evaluation
    print("\nEvaluating Model...")
    y_pred_logits = model.predict(val_dataset).logits
    y_pred = np.argmax(y_pred_logits, axis=1)
    
    print("\nClassification Report:")
    print(classification_report(val_labels, y_pred, target_names=le.classes_))
    
    # Save Model
    save_path = os.path.join("backend", "nlp", "bert_model") # Keeping same directory name for simplicity
    if os.path.exists(save_path):
        shutil.rmtree(save_path)
    os.makedirs(save_path)
    
    model.save_pretrained(save_path)
    tokenizer.save_pretrained(save_path)
    print(f"Model and tokenizer saved to {save_path}")

if __name__ == "__main__":
    train_model()
