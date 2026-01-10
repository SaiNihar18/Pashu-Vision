# 🚀 EXACT CONVERSION SCRIPT FOR YOUR RESNET-50 MODEL
# Copy this entire script to Google Colab

# ================================
# Step 1: Install Dependencies
# ================================
!pip install torch torchvision onnx tensorflowjs tensorflow

# ================================
# Step 2: Upload Files to Colab
# ================================
# Upload these files to your Colab session:
# - best_bovine_model.pth
# - class_names.pkl

import torch
import torch.nn as nn
from torchvision import models
import joblib
import json
import os

# ================================
# Step 3: Recreate Your Exact Model
# ================================
device = torch.device('cpu')  # Use CPU for conversion

# Load class names
class_names = joblib.load("class_names.pkl")
num_classes = len(class_names)
print(f"Number of classes: {num_classes}")
print(f"Classes: {class_names[:5]}...")  # Show first 5

# Recreate your exact model architecture
def create_model(num_classes):
    """Recreate your exact ResNet-50 model"""
    model = models.resnet50(weights=None)  # Don't load pretrained weights
    
    # Replace final layer exactly as you did
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(model.fc.in_features, num_classes)  # 2048 -> num_classes
    )
    return model

# Create model and load your trained weights
model = create_model(num_classes)
model.load_state_dict(torch.load("best_bovine_model.pth", map_location=device))
model.eval()

print("✅ Model loaded successfully!")
print(f"Model input size: {model.fc[1].in_features} -> {model.fc[1].out_features}")

# ================================
# Step 4: Test Model Loading
# ================================
# Create dummy input to test
dummy_input = torch.randn(1, 3, 224, 224)
with torch.no_grad():
    output = model(dummy_input)
    print(f"Output shape: {output.shape}")
    print(f"Sample predictions: {torch.softmax(output, dim=1)[0][:5]}")

# ================================
# Step 5: Convert to ONNX
# ================================
onnx_path = "breed_classifier.onnx"

torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print(f"✅ ONNX model exported to: {onnx_path}")

# ================================
# Step 6: Convert to TensorFlow.js
# ================================
# Option A: Direct conversion (might work)
try:
    import tensorflowjs as tfjs
    
    # Convert ONNX to TensorFlow.js
    os.system(f"tensorflowjs_converter --input_format=onnx --output_format=tfjs_layers_model {onnx_path} ./tfjs_model")
    print("✅ TensorFlow.js conversion successful!")
    
except Exception as e:
    print(f"❌ TensorFlow.js conversion failed: {e}")
    print("💡 We'll use ONNX format instead")

# ================================
# Step 7: Create Model Metadata
# ================================
model_info = {
    "model_type": "resnet50_finetuned",
    "architecture": "ResNet-50 with custom FC layer",
    "input_shape": [224, 224, 3],
    "num_classes": num_classes,
    "class_names": class_names,
    "preprocessing": {
        "resize": [224, 224],
        "normalize": True,
        "mean": [0.485, 0.456, 0.406],
        "std": [0.229, 0.224, 0.225]
    },
    "training_info": {
        "base_model": "ResNet-50",
        "frozen_layers": "conv1, bn1, relu, maxpool, layer1, layer2, layer3",
        "trainable_layers": "layer4, fc",
        "final_layer": "Dropout(0.5) + Linear(2048, 41)",
        "optimizer": "Adam",
        "learning_rate": 1e-4
    }
}

with open("model_info.json", "w") as f:
    json.dump(model_info, f, indent=2)

with open("class_names.json", "w") as f:
    json.dump(class_names, f, indent=2)

print("✅ Metadata files created!")

# ================================
# Step 8: Download Files
# ================================
print("\n🎯 FILES TO DOWNLOAD:")
print("1. breed_classifier.onnx")
print("2. model_info.json") 
print("3. class_names.json")
print("4. tfjs_model/ folder (if conversion succeeded)")

print("\n📂 Upload these to your BreedAI project:")
print("- Place in: /Users/tanishqsuryas/Downloads/breedai 2/public/models/breed_classifier/")

# ================================
# Step 9: Verify Conversion
# ================================
import onnx

# Load and verify ONNX model
onnx_model = onnx.load(onnx_path)
onnx.checker.check_model(onnx_model)
print("✅ ONNX model verification passed!")

print("\n🎉 CONVERSION COMPLETE!")
print("Next: Upload the files to your BreedAI project")