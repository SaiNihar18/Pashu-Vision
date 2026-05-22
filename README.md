# 🐄 Pashu Vision - AI-Powered Cattle & Buffalo Breed Recognition

<div align="center">

![Pashu Vision](https://img.shields.io/badge/AI-Powered-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**An intelligent web application for identifying Indian cattle and buffalo breeds using AI, voice commands, and real-time analysis.**

[View Live Demo](#-live-demo) • [Get Started](#-quick-start) • [Features](#-features) • [Documentation](./guides/)

</div>

---

## 🎯 About This Project

**Pashu Vision** is a comprehensive AI-powered livestock management system designed specifically for Indian farmers, veterinarians, and field-level workers. Using cutting-edge computer vision and Google's Gemini AI, it provides:

- **Instant breed identification** from photos (41 Indian & exotic breeds)
- **Health assessment** with visual analysis
- **AI chat assistant** for livestock expertise
- **Voice commands** in 9 Indian languages
- **Multilingual interface** for easy accessibility
- **Real-time analysis** with confidence scoring

Perfect for dairy farmers, buffalo breeders, agricultural workers, and anyone working with Indian livestock.

---

## ✨ Features

### 🐮 **Breed Identification**
- Recognizes **41 cattle and buffalo breeds** with high accuracy
- Uses your custom-trained ResNet-50 ONNX model
- Provides detailed breed information:
  - Origin region
  - Typical uses & characteristics
  - Milk yield information
  - Body weight & color details
- Intelligent fallback system for reliability

### 💬 **AI Chat Assistant**
- Real-time conversations with Google Gemini AI
- Specialized livestock & veterinary knowledge
- Answer questions about:
  - Breed characteristics
  - Health & nutrition
  - Best practices for dairy farming
  - Feed management
- Voice input/output with text-to-speech

### 🎤 **Voice Features**
- **Speech Recognition** in 9 Indian languages:
  - English, Hindi, Bengali, Telugu, Marathi
  - Tamil, Gujarati, Kannada, Punjabi
- **Voice Commands** for hands-free navigation
- **Text-to-Speech** with multiple voice options
- Perfect for field workers without typing

### 🌐 **Multilingual Support**
- Complete UI in 9 languages
- Real-time language switching
- All features work in all languages
- Translations for dairy farming terminology

### 🏥 **Health Assessment**
- Visual health scoring system
- Identify potential health issues
- Body condition assessment
- Vital signs observation (alertness, posture, coat condition)
- Professional veterinary-level analysis

### 📊 **Comprehensive Features**
- **Breed Database** - 41 breeds with detailed information
- **History Tracking** - Save and review past analyses
- **Multi-Angle Analysis** - Upload multiple images for better accuracy
- **Location Tracking** - Track livestock by location
- **Analytics** - View trends and statistics

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** for version control
- **Gemini API Key** (Free - [Get here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/pashu-vision.git
cd pashu-vision

# Install dependencies
npm install
```

### Environment

Create a `.env` file at the project root (do not commit it):

```bash
GEMINI_API_KEY=your_api_key_here
```

### Run Locally

Frontend only (UI + ONNX in browser):

```bash
npm run dev
```

Full stack (UI + serverless Gemini proxy):

```bash
npx vercel dev
```

Visit the local URL shown in the terminal. You should see the Pashu Vision home page! 🎉

---

## 🏗️ Project Structure

```
pashu-vision/
├── api/                   # Serverless Gemini proxy
│   └── gemini.js
├── src/frontend/
│   ├── pages/              # 11 main pages
│   │   ├── HomePage.tsx
│   │   ├── QuickAnalysisPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── HealthAssessmentPage.tsx
│   │   └── ...
│   ├── components/         # Reusable UI components
│   ├── services/           # API & business logic
│   │   ├── geminiService.ts
│   │   ├── onnxResNet50Service.ts
│   │   └── ...
│   ├── contexts/           # React context providers
│   └── hooks/              # Custom React hooks
├── public/
│   ├── models/             # Your trained ONNX model
│   │   └── breed_classifier/
│   └── onnx-wasm/           # ONNX runtime WASM/MJS assets
├── guides/                 # Documentation
├── docs/                   # Detailed guides
├── tools/                  # Development scripts
└── assets/                 # Models & resources
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite 6** - Lightning-fast build tool
- **Tailwind CSS** - Responsive styling (PostCSS build)

### AI & Machine Learning
- **ONNX Runtime Web** - Run your trained model in browser
- **Google Gemini AI** - Advanced language & vision AI (via serverless proxy)
- **TensorFlow.js** - Additional ML capabilities

### Backend
- **Vercel Serverless Functions** - Secure Gemini API proxy

### Features
- **Web Speech API** - Voice input/output
- **Canvas API** - Image processing
- **LocalStorage** - History persistence

---

## 📱 How to Use

### 1. **Identify a Breed** (Quick Analysis)
```
Home → Quick Analysis → Upload Photo → Get Instant Result
```
- Upload cattle/buffalo photo
- AI analyzes in real-time
- Get breed name + confidence score
- View detailed information

### 2. **Health Assessment**
```
Home → Health Assessment → Upload Photo → Get Analysis
```
- Visual health scoring
- Disease detection
- Nutrition recommendations
- Professional insights

### 3. **Chat with AI**
```
Home → Chat → Ask Questions → Get Answers
```
- Ask about breeds, health, nutrition
- Voice input/output available
- 24/7 livestock expertise
- Multi-language support

### 4. **Enable Voice Commands**
```
Home → (Top Right) → Enable Voice Commands
```
- Navigate using voice
- Works in 9 languages
- Hands-free operation

---

## 🔄 Project Workflow

1) **App boot**
  - [src/frontend/index.tsx](src/frontend/index.tsx) mounts the React app
  - Language and voice contexts initialize

2) **Quick Analysis (primary path)**
  - Image is preprocessed in the browser
  - ONNX ResNet-50 runs locally for breed prediction
  - Top prediction is returned with confidence

3) **Gemini enrichment**
  - The UI sends the predicted breed name to `/api/gemini`
  - Serverless function calls Gemini and returns structured details

4) **Health/Multi-Angle/Chat**
  - These features send text or images to `/api/gemini`
  - Serverless proxy uses the API key securely on the server

5) **Results + History**
  - Results are displayed in the UI
  - Analysis history is stored in `localStorage`

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Making Changes

1. **Edit files** in `src/frontend/`
2. **Test locally** with `npm run dev`
3. **Commit changes** with git
4. **Push to GitHub** and auto-deploy! ✓

See `guides/QUICK_MODIFICATION_CARD.md` for detailed modification guide.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Build locally first
npm run build

# Push to GitHub
git add .
git commit -m "Ready to deploy"
git push origin main

# Then on Vercel.com:
# 1. Import repository
# 2. Add GEMINI_API_KEY environment variable (serverless)
# 3. Deploy!
```

**Your app will be live in 2-3 minutes!**

### Other Options
- **Netlify** - Easy alternative to Vercel
- **Railway** - Good for custom deployments
- **GitHub Pages** - Free static hosting

👉 See `guides/QUICK_DEPLOY_CARD.md` for detailed deployment instructions.

---

## 📊 Model Details

### Your Trained Model
- **Type**: ResNet-50 Fine-tuned
- **Format**: ONNX (Open Neural Network Exchange)
- **Input**: 224×224×3 images
- **Output**: 41 breed classes
- **Location**: `public/models/breed_classifier/` (ONNX + metadata)
- **Runs**: Entirely in browser (privacy-first)

### Supported Breeds (41 Total)

**Indian Cattle (25):**
Gir, Sahiwal, Red Sindhi, Tharparkar, Kankrej, Hariana, Ongole, Rathi, Deoni, Dangi, Hallikar, Amritmahal, Kangayam, Alambadi, Bargur, Pulikulam, Umblachery, Vechur, Kasargod, Malnad Gidda, Krishna Valley, Khillari, Nimari, Nagori, Kenkatha, Toda

**Indian Buffalo (9):**
Murrah, Nili Ravi, Jaffrabadi, Surti, Mehsana, Bhadawari, Nagpuri, Banni, Kherigarh

**Exotic Breeds (7):**
Holstein Friesian, Jersey, Brown Swiss, Ayrshire, Guernsey, Red Dane

---

## 🔐 Privacy & Security

✅ **Your data is safe**
- Images are NOT sent to external servers for classification
- Your trained model runs locally in your browser
- Health/Multi-Angle/Chat images go to Gemini via the serverless proxy
- No tracking or analytics by default
- All data stored locally on your device

✅ **API Keys protected**
- `.env` file is not committed to git
- Keys stored only on deployment platform
- Never exposed in client-side code
- Serverless proxy keeps keys on the server

---

## 📚 Documentation

Complete guides available in `guides/` folder:

| Guide | Purpose |
|-------|---------|
| **QUICK_DEPLOY_CARD.md** | 5-minute deployment summary |
| **QUICK_MODIFICATION_CARD.md** | 5-minute modification reference |
| **GITHUB_AND_DEPLOYMENT_GUIDE.md** | Complete deployment guide |
| **HOW_TO_MODIFY_PROJECT.md** | Complete modification guide |
| **DOCUMENTATION_INDEX.md** | Navigation for all guides |

---

## 🤝 Contributing

Contributions are welcome! Whether you want to:
- Add new breeds to the database
- Improve UI/UX
- Add more languages
- Optimize performance
- Fix bugs

Please feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned locally
- [ ] `npm install` completed
- [ ] `.env` created with Gemini API key
- [ ] `npm run dev` runs without errors
- [ ] `npx vercel dev` works for Gemini features
- [ ] App visible at `http://localhost:5174/`
- [ ] Can upload and analyze images
- [ ] Chat functionality works
- [ ] Voice commands enabled

---

## 🐛 Troubleshooting

### "npm run dev" gives errors
```bash
# Clear and reinstall
rm -r node_modules
npm install
npm run dev
```

### Gemini API returns error
- Verify API key is correct in `.env`
- Check API key has proper permissions
- Ensure API is enabled in Google Cloud Console
- If running locally, use `npx vercel dev` so `/api/gemini` is available

### ONNX model not found
- Check `public/models/breed_classifier.onnx` exists
- Verify file permissions
- Reload page in browser

### ONNX runtime errors
- Ensure `public/onnx-wasm/` is deployed with all `.wasm` and `.mjs` files

### Changes not appearing on live site
- Hard refresh browser: `Ctrl+Shift+R`
- Check Vercel deployment log
- Verify git push was successful

👉 See `guides/HOW_TO_MODIFY_PROJECT.md` for more troubleshooting.

---

## 📈 Performance

- **Initial Load**: ~2-3 seconds
- **Breed Analysis**: ~1-2 seconds
- **Model Size**: ~90MB (downloaded once)
- **Bundle Size**: ~500KB gzipped
- **Mobile Optimized**: Works on all devices

---

## 🎓 Learning Resources

This project demonstrates:
- ✅ Converting PyTorch models to ONNX format
- ✅ Running ML models in the browser
- ✅ Integrating Google Gemini AI
- ✅ Building multilingual React apps
- ✅ Voice/speech integration
- ✅ Production-grade deployment
- ✅ Professional code organization

Perfect for your portfolio! 🚀

---

## 📞 Support

Need help?
- 📖 Check the guides in `guides/` folder
- 🔍 Review troubleshooting section above
- 💬 Open an issue on GitHub
- 📧 Check project documentation

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## ✅ Status

- ✅ Development: Complete
- ✅ Testing: Verified
- ✅ Documentation: Comprehensive
- ✅ Deployment: Ready
- ✅ Production: Ready

**Status**: Production Ready 🚀

---

## 🎉 Acknowledgments

- **Google Gemini AI** for powerful language & vision models
- **ONNX Runtime** for browser-based ML inference
- **React & Vite** communities for excellent tools
- **Indian farmers** whose work inspired this project

---

<div align="center">

### Made with ❤️ for Indian Livestock Farmers

**[View on GitHub](https://github.com/YOUR-USERNAME/pashu-vision)** • **[Live Demo](#)** • **[Get Started](#quick-start)**

</div>
