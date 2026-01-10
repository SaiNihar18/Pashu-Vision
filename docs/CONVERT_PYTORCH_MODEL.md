# PyTorch to ONNX Model Conversion Guide

Since your PyTorch model needs to be converted for browser use, here are the steps to convert your `best_bovine_model.pth` to ONNX format.

## Option 1: Convert on the same environment where you trained the model

If you have access to the environment where you trained the model, run this script:

```python
import torch
import torch.onnx
import pickle

# Load your model class definition (you'll need to replace this with your actual model class)
class YourModelClass(torch.nn.Module):
    def __init__(self, num_classes=41):
        super(YourModelClass, self).__init__()
        # Add your model architecture here
        # This is just a placeholder - replace with your actual model structure
        pass
    
    def forward(self, x):
        # Add your forward pass here
        pass

# Load the model
model = YourModelClass(num_classes=41)
model.load_state_dict(torch.load('best_bovine_model.pth', map_location='cpu'))
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 224, 224)  # Adjust input size if needed

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    'public/models/breed_classifier/model.onnx',
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

print("Model converted to ONNX format!")
```

## Option 2: Use a pre-trained model architecture

If your model is based on a common architecture (ResNet, EfficientNet, etc.), you can try:

```python
import torch
import torchvision.models as models
import torch.onnx

# Example for ResNet (replace with your actual architecture)
model = models.resnet50(pretrained=False, num_classes=41)

# Load your trained weights
state_dict = torch.load('best_bovine_model.pth', map_location='cpu')
model.load_state_dict(state_dict)
model.eval()

# Export to ONNX
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy_input,
    'public/models/breed_classifier/model.onnx',
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output']
)
```

## Option 3: Temporary Fallback (Currently Active)

For now, I've implemented a fallback system that:
1. Simulates your model's predictions using the 41 breed classes
2. Randomly selects from your actual breed list
3. Passes the breed name to Gemini for detailed information

This allows you to test the complete workflow while you convert your model.

## Required Files Structure

After conversion, you should have:
```
public/models/breed_classifier/
├── model.onnx          (your converted model)
└── class_names.json    (already created)
```

## Next Steps

1. Convert your model using one of the options above
2. Place the `model.onnx` file in `public/models/breed_classifier/`
3. The web application will automatically detect and use your model
4. Test with real images!

## Need Help?

If you need help with the conversion, please share:
1. The model architecture you used for training
2. Any training framework details (timm, torchvision, custom architecture)
3. Input image size used during training

The fallback system is working now, so you can test the complete flow with Gemini integration!