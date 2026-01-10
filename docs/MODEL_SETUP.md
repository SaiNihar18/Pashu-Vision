# Custom Model Setup Instructions

## Converting Your PyTorch .pth File to TensorFlow.js

### Prerequisites
1. Python with PyTorch installed
2. Your trained `.pth` model file

### Step 1: Install TensorFlow.js Converter
```bash
pip install tensorflowjs
```

### Step 2: Convert Your Model
```bash
# Replace 'your_model.pth' with your actual model file path
tensorflowjs_converter \
  --input_format=pytorch \
  --output_format=tfjs_layers_model \
  /path/to/your_model.pth \
  ./public/models/breed_classifier
```

### Step 3: Verify Files
After conversion, you should have these files in `public/models/breed_classifier/`:
- `model.json` (model architecture)
- `model_weights.bin` (or multiple `.bin` files with weights)

### Step 4: Update Model Classes (if needed)
Edit `services/customModelService.ts` and update the `BREED_CLASSES` array to match your model's output classes:

```typescript
const BREED_CLASSES = [
  'YourBreed1',
  'YourBreed2', 
  'YourBreed3',
  // ... add all your breed classes in the same order as your model training
];
```

### Step 5: Test the Integration
1. Make sure your Gemini API key is set in `.env`
2. Start the development server: `npm run dev`
3. Upload an image and test the prediction

## Model Requirements
- Input: 224x224 RGB image (adjust in `customModelService.ts` if different)
- Output: Probability scores for each breed class
- Format: TensorFlow.js compatible model

## Troubleshooting
- If conversion fails, ensure your PyTorch model is compatible
- Check console for loading errors
- Verify file paths and permissions
- Make sure model input/output dimensions match the service expectations

## Alternative: Use ONNX Format
If PyTorch to TensorFlow.js conversion doesn't work, you can:
1. Convert PyTorch → ONNX → TensorFlow.js
2. Use ONNX.js directly (already included in dependencies)

Need help? Check the browser console for detailed error messages.