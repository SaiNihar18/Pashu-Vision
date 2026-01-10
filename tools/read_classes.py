#!/usr/bin/env python3
"""
Simple script to read class names from pickle file
"""

import pickle
import json

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

def main():
    pkl_path = "class_names.pkl"
    
    print("=== Reading Class Names ===")
    
    # Load class names
    class_names = load_class_names(pkl_path)
    if class_names is None:
        return
    
    # Save as JSON for easy access
    with open("class_names.json", 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print(f"\n✅ Class names saved to class_names.json")
    print(f"📊 Total breeds: {len(class_names)}")

if __name__ == "__main__":
    main()