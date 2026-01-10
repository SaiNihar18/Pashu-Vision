#!/usr/bin/env python3
"""
Model Structure Inspector
This script helps identify your model structure without loading PyTorch
"""

import pickle
import os

def inspect_files():
    """Inspect the model and pickle files to understand structure"""
    print("🔍 BreedAI Model File Inspector")
    print("=" * 50)
    
    # Check files
    files_to_check = {
        "best_bovine_model.pth": "PyTorch Model",
        "class_names.pkl": "Class Names",
        "class_names.json": "Class Names JSON"
    }
    
    for filename, description in files_to_check.items():
        if os.path.exists(filename):
            size = os.path.getsize(filename)
            print(f"✅ {description}: {filename} ({size:,} bytes)")
        else:
            print(f"❌ {description}: {filename} (not found)")
    
    print("\n📊 Model Analysis:")
    
    # Check model file structure without loading PyTorch
    model_path = "best_bovine_model.pth"
    if os.path.exists(model_path):
        try:
            # Try to load as pickle first to see structure
            import pickle
            with open(model_path, 'rb') as f:
                # Read just the header to understand format
                magic = f.read(8)
                print(f"Model file magic bytes: {magic}")
                
                # Try to peek at pickle structure
                f.seek(0)
                try:
                    # This might fail but gives us info
                    unpickler = pickle.Unpickler(f)
                    protocol = unpickler.load()
                    print(f"Pickle protocol: {protocol}")
                except:
                    print("Complex pickle structure detected")
                    
        except Exception as e:
            print(f"Model file format: Binary (likely PyTorch checkpoint)")
    
    # Try to extract some metadata
    print(f"\n🏗️ Model File Size Analysis:")
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"Size: {size_mb:.1f} MB")
        
        # Estimate model complexity
        if size_mb < 10:
            print("Complexity: Small model (likely simple CNN)")
        elif size_mb < 50:
            print("Complexity: Medium model (ResNet-18/34 level)")
        elif size_mb < 200:
            print("Complexity: Large model (ResNet-50+ level)")
        else:
            print("Complexity: Very large model (complex architecture)")
    
    print(f"\n📋 Conversion Options:")
    print("1. 🐍 PyTorch → ONNX → Browser")
    print("2. 🔄 PyTorch → TensorFlow.js → Browser") 
    print("3. 🌐 Deploy model as API service")
    print("4. 🧠 Use model on server, send predictions to frontend")

def check_python_environment():
    """Check what tools are available"""
    print(f"\n🛠️ Available Tools:")
    
    tools = [
        ("torch", "PyTorch"),
        ("onnx", "ONNX"),
        ("tensorflowjs", "TensorFlow.js converter"),
        ("tensorflow", "TensorFlow"),
        ("numpy", "NumPy"),
        ("PIL", "Pillow (Image processing)")
    ]
    
    for module, name in tools:
        try:
            __import__(module)
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} (not installed)")

def recommend_approach():
    """Recommend the best approach based on available tools"""
    print(f"\n💡 Recommended Approach:")
    print("Given the PyTorch compatibility issues on your M1 Mac:")
    print()
    print("🥇 **Option 1: Cloud Conversion** (Recommended)")
    print("   - Use Google Colab or similar cloud service")
    print("   - Convert PyTorch → ONNX or TensorFlow.js")
    print("   - Download converted model")
    print()
    print("🥈 **Option 2: Model API Service**")
    print("   - Deploy your model on a server/cloud")
    print("   - Frontend sends images to API")
    print("   - API returns predictions")
    print()
    print("🥉 **Option 3: Architecture Recreation**")
    print("   - Recreate model architecture in TensorFlow.js")
    print("   - Transfer weights manually")
    print("   - More complex but gives full control")

if __name__ == "__main__":
    inspect_files()
    check_python_environment()
    recommend_approach()
    
    print(f"\n🎯 Next Steps:")
    print("1. Tell me your model training details (architecture, framework)")
    print("2. Choose conversion approach based on recommendations")
    print("3. I'll provide step-by-step conversion instructions")
    print("4. Integrate converted model into your BreedAI app")