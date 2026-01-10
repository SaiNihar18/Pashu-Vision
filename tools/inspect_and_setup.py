#!/usr/bin/env python3
"""
Alternative Model Conversion for BreedAI
This script provides multiple approaches to convert your PyTorch model
"""

import pickle
import json
import os
from pathlib import Path

def load_class_names(pkl_path):
    """Load class names from pickle file"""
    try:
        with open(pkl_path, 'rb') as f:
            class_names = pickle.load(f)
        print(f"✅ Loaded {len(class_names)} class names")
        return class_names
    except Exception as e:
        print(f"❌ Error loading class names: {e}")
        return None

def inspect_model(model_path):
    """Inspect the PyTorch model to understand its structure"""
    print(f"🔍 Inspecting model: {model_path}")
    
    try:
        # Try to load without torch first to see file structure
        import torch
        
        # Load with different methods
        print("Method 1: Loading with weights_only=True...")
        try:
            model_data = torch.load(model_path, map_location='cpu', weights_only=True)
            print(f"✅ Loaded successfully. Type: {type(model_data)}")
            
            if isinstance(model_data, dict):
                print(f"📋 Keys found: {list(model_data.keys())[:10]}")
                
                # Check for common model structure patterns
                if 'state_dict' in model_data:
                    print("🎯 Found 'state_dict' key - this is a checkpoint")
                    state_dict = model_data['state_dict']
                elif any('conv' in key or 'fc' in key or 'classifier' in key for key in model_data.keys()):
                    print("🎯 Looks like a direct state_dict")
                    state_dict = model_data
                else:
                    print("❓ Unknown structure")
                    state_dict = model_data
                
                # Analyze layer structure
                layer_info = {}
                for key in list(state_dict.keys())[:20]:  # First 20 layers
                    layer_info[key] = state_dict[key].shape if hasattr(state_dict[key], 'shape') else 'unknown'
                
                print("🏗️ Model architecture preview:")
                for key, shape in layer_info.items():
                    print(f"   {key}: {shape}")
                    
            return model_data
            
        except Exception as e:
            print(f"❌ Method 1 failed: {e}")
            
        print("Method 2: Loading with weights_only=False...")
        try:
            model_data = torch.load(model_path, map_location='cpu', weights_only=False)
            print(f"✅ Loaded successfully. Type: {type(model_data)}")
            return model_data
        except Exception as e:
            print(f"❌ Method 2 failed: {e}")
            
    except ImportError:
        print("❌ PyTorch not available. Cannot inspect model structure.")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def create_tfjs_compatible_structure(class_names, output_dir):
    """Create a structure that TensorFlow.js can work with"""
    os.makedirs(output_dir, exist_ok=True)
    
    # Save class names
    class_names_path = os.path.join(output_dir, "class_names.json")
    with open(class_names_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    print(f"✅ Class names saved to {class_names_path}")
    
    # Create model info
    model_info = {
        "model_type": "image_classification",
        "num_classes": len(class_names),
        "input_shape": [224, 224, 3],  # Height, Width, Channels for TF.js
        "class_names": class_names,
        "preprocessing": {
            "resize": [224, 224],
            "normalize": True,
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        },
        "status": "fallback_mode",
        "note": "Using intelligent fallback until real model is converted"
    }
    
    info_path = os.path.join(output_dir, "model_info.json")
    with open(info_path, 'w') as f:
        json.dump(model_info, f, indent=2)
    print(f"✅ Model info saved to {info_path}")
    
    # Create a placeholder model.json for TensorFlow.js compatibility
    placeholder_model = {
        "format": "layers-model",
        "generatedBy": "BreedAI-Converter",
        "convertedBy": "Fallback System",
        "modelTopology": {
            "class_name": "Sequential",
            "config": {
                "name": "breed_classifier",
                "layers": []
            }
        },
        "weightsManifest": [],
        "userDefinedMetadata": {
            "note": "This is a placeholder. Real model conversion needed.",
            "breeds": len(class_names)
        }
    }
    
    model_json_path = os.path.join(output_dir, "model.json")
    with open(model_json_path, 'w') as f:
        json.dump(placeholder_model, f, indent=2)
    print(f"✅ Placeholder model.json created at {model_json_path}")

def main():
    print("🚀 BreedAI Alternative Model Setup")
    print("=" * 50)
    
    # Paths
    pkl_path = "class_names.pkl"
    model_path = "best_bovine_model.pth"
    output_dir = "public/models/breed_classifier"
    
    # Step 1: Load class names
    class_names = load_class_names(pkl_path)
    if not class_names:
        print("❌ Cannot proceed without class names")
        return
    
    # Step 2: Inspect the model
    model_data = inspect_model(model_path)
    
    # Step 3: Create TensorFlow.js compatible structure
    create_tfjs_compatible_structure(class_names, output_dir)
    
    print("\n" + "=" * 50)
    print("✅ Setup completed!")
    print("\n📋 What was done:")
    print(f"   • Extracted {len(class_names)} breed classes")
    print(f"   • Created model structure in {output_dir}")
    print(f"   • Generated placeholder files for TensorFlow.js compatibility")
    
    if model_data:
        print(f"   • Analyzed your PyTorch model structure")
    
    print("\n🎯 Next Steps:")
    print("   1. Your app will use improved intelligent fallback predictions")
    print("   2. For real model integration, we need to:")
    print("      - Identify your exact model architecture")
    print("      - Convert to TensorFlow.js or ONNX format")
    print("      - Integrate with the web interface")
    
    print("\n💡 To improve accuracy:")
    print("   1. First, test with the current improved fallback")
    print("   2. Share your model training code/architecture")
    print("   3. We'll implement proper model conversion")

if __name__ == "__main__":
    main()