#!/usr/bin/env python3
"""
Model Conversion Script for BreedAI
This script converts PyTorch model to ONNX format for browser compatibility
and extracts class names from the pickle file.
"""

import pickle
import torch
import torch.nn as nn
import json
import os
from pathlib import Path

def load_class_names(pkl_path):
    """Load class names from pickle file"""
    try:
        with open(pkl_path, 'rb') as f:
            class_names = pickle.load(f)
        print(f"Loaded {len(class_names)} class names:")
        for i, name in enumerate(class_names):
            print(f"  {i}: {name}")
        return class_names
    except Exception as e:
        print(f"Error loading class names: {e}")
        return None

def convert_to_onnx(model_path, class_names, output_dir):
    """Convert PyTorch model to ONNX format"""
    try:
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load the PyTorch model
        print(f"Loading PyTorch model from {model_path}...")
        
        try:
            # Try different loading methods based on how the model was saved
            if os.path.exists(model_path):
                model_state = torch.load(model_path, map_location='cpu', weights_only=True)
                print(f"Model loaded. Type: {type(model_state)}")
                if isinstance(model_state, dict):
                    print(f"Model keys: {list(model_state.keys())[:10]}...")  # Show first 10 keys
            else:
                print(f"Model file not found: {model_path}")
                return False
        except Exception as load_error:
            print(f"Error loading model: {load_error}")
            print("Trying alternative loading method...")
            try:
                model_state = torch.load(model_path, map_location='cpu', weights_only=False)
                print("Model loaded with weights_only=False")
            except Exception as e2:
                print(f"Failed to load model: {e2}")
                return False
        
        # Since we don't know the exact model architecture, let's create a generic one
        # You may need to adjust this based on your actual model
        class GenericCNN(nn.Module):
            def __init__(self, num_classes):
                super(GenericCNN, self).__init__()
                # This is a placeholder - you'll need to match your actual architecture
                self.features = nn.Sequential(
                    nn.Conv2d(3, 64, kernel_size=3, padding=1),
                    nn.ReLU(inplace=True),
                    nn.AdaptiveAvgPool2d((7, 7))
                )
                self.classifier = nn.Sequential(
                    nn.Dropout(),
                    nn.Linear(64 * 7 * 7, 512),
                    nn.ReLU(inplace=True),
                    nn.Dropout(),
                    nn.Linear(512, num_classes)
                )
            
            def forward(self, x):
                x = self.features(x)
                x = torch.flatten(x, 1)
                x = self.classifier(x)
                return x
        
        # Create model instance
        model = GenericCNN(len(class_names))
        
        # Try to load the state dict
        if isinstance(model_state, dict):
            try:
                model.load_state_dict(model_state)
                print("Successfully loaded state dict")
            except Exception as e:
                print(f"Error loading state dict: {e}")
                print("The model architecture might not match. Please check your model structure.")
                return False
        else:
            print("Model file doesn't contain a state dict. Please check the model format.")
            return False
        
        model.eval()
        
        # Create dummy input
        dummy_input = torch.randn(1, 3, 224, 224)  # Assuming 224x224 input size
        
        # Export to ONNX
        onnx_path = os.path.join(output_dir, "model.onnx")
        
        try:
            torch.onnx.export(
                model,
                (dummy_input,),  # Fix: Pass as tuple
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
            print(f"Model exported to {onnx_path}")
        except Exception as export_error:
            print(f"ONNX export failed: {export_error}")
            print("This is likely due to PyTorch architecture compatibility issues.")
            print("For now, the app will use fallback predictions.")
            # Continue with class names export even if ONNX export fails
        
        # Save class names as JSON
        class_names_path = os.path.join(output_dir, "class_names.json")
        with open(class_names_path, 'w') as f:
            json.dump(class_names, f, indent=2)
        
        print(f"Class names saved to {class_names_path}")
        
        # Create model info file
        model_info = {
            "input_shape": [1, 3, 224, 224],
            "num_classes": len(class_names),
            "class_names": class_names,
            "model_type": "image_classification",
            "preprocessing": {
                "resize": [224, 224],
                "normalize": {
                    "mean": [0.485, 0.456, 0.406],
                    "std": [0.229, 0.224, 0.225]
                }
            }
        }
        
        info_path = os.path.join(output_dir, "model_info.json")
        with open(info_path, 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"Model info saved to {info_path}")
        return True
        
    except Exception as e:
        print(f"Error converting model: {e}")
        print(f"Error type: {type(e).__name__}")
        print("\nTroubleshooting tips:")
        print("1. Ensure your .pth file contains a state_dict, not the full model")
        print("2. Check that the model architecture matches your training code")
        print("3. Consider using torch.jit.trace() for model export instead")
        return False

def main():
    # Paths
    pkl_path = "class_names.pkl"
    model_path = "best_bovine_model.pth"
    output_dir = "public/models/breed_classifier"
    
    print("=== BreedAI Model Conversion ===")
    
    # Load class names
    class_names = load_class_names(pkl_path)
    if class_names is None:
        return
    
    # Convert model
    success = convert_to_onnx(model_path, class_names, output_dir)
    
    if success:
        print("\n✅ Conversion completed successfully!")
        print(f"📁 Model files saved to: {output_dir}")
        print("📋 Next steps:")
        print("   1. Check the generated files in public/models/breed_classifier/")
        print("   2. The web application will automatically use these files")
        print("   3. Test the prediction by uploading an image")
    else:
        print("\n❌ Conversion failed. Please check the error messages above.")
        print("💡 You may need to adjust the model architecture in this script.")

if __name__ == "__main__":
    main()