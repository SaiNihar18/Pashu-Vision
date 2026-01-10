# 🚀 GitHub & Deployment Guide

## Part 1: Upload to GitHub

### Prerequisites
- GitHub account (free at https://github.com)
- Git installed on your computer

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Name it: `pashu-vision` (or your preferred name)
3. Add description: "AI-Powered Cattle & Buffalo Breed Recognition"
4. Choose visibility: **Public** (for portfolio) or **Private**
5. Click "Create repository"

### Step 2: Initialize Git & Push Code

Open PowerShell in your project folder and run:

```bash
# Initialize git repository
git init

# Add your GitHub repository as origin
# Replace USERNAME and REPO_NAME with your GitHub username and repo name
git remote add origin https://github.com/USERNAME/pashu-vision.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Pashu Vision - AI Cattle Breed Recognition System"

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**First time setup?** You may need to authenticate:
- GitHub will prompt you to log in
- Or use: `git config --global user.email "your-email@example.com"`
- And: `git config --global user.name "Your Name"`

### Step 3: Verify Upload

Visit: `https://github.com/USERNAME/pashu-vision`

You should see all your code! ✅

---

## Part 2: Deployment Options

### **Option A: Vercel (RECOMMENDED) ⭐**

**Best for:** React/Vite projects, easiest setup, free tier included

#### Steps:

1. **Go to Vercel**: https://vercel.com
2. **Sign up** with GitHub (click "Continue with GitHub")
3. **Authorize Vercel** to access your repositories
4. **Select repository**: `pashu-vision`
5. **Configure**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `dist` (should auto-detect)
   - Install Command: `npm install`

6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add `GEMINI_API_KEY` = your API key
   - Add `CUSTOM_MODEL_PATH` = `/models/breed_classifier`
   - Add `USE_CUSTOM_MODEL` = `true`
   - Add `FALLBACK_TO_GEMINI` = `true`

7. **Deploy**: Click "Deploy" button
8. **Done!** Your app will be live in ~2-3 minutes

**Your live URL**: `https://pashu-vision.vercel.app` (automatically assigned)

**Pros:**
- ✅ Easiest setup
- ✅ Free tier with generous limits
- ✅ Automatic deployments on git push
- ✅ Great for React/Vite apps
- ✅ Custom domain support

---

### **Option B: Netlify**

**Best for:** Alternative to Vercel, also excellent

#### Steps:

1. **Go to Netlify**: https://netlify.com
2. **Sign up** with GitHub
3. **New site from Git** → Select repository
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Add Environment Variables** (in Site settings):
   - `GEMINI_API_KEY` = your API key
   - `VITE_CUSTOM_MODEL_PATH` = `/models/breed_classifier`
   - (Add all from your .env file)

6. **Deploy** - automatic!

**Pros:**
- ✅ Free tier
- ✅ Easy setup
- ✅ Form handling built-in
- ✅ Good analytics

---

### **Option C: GitHub Pages (FREE)**

**Best for:** Simple static hosting, but requires build output

#### Steps:

1. **Update vite.config.ts**:
```typescript
export default defineConfig({
  base: '/pashu-vision/',  // Add this line
  // ... rest of config
});
```

2. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

3. **Update package.json scripts**:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

4. **Deploy**:
```bash
npm run deploy
```

5. **Configure GitHub**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages, folder: /(root)

**Your URL**: `https://USERNAME.github.io/pashu-vision`

**Pros:**
- ✅ Completely free
- ✅ Hosted on GitHub
- ✅ No external account needed

**Cons:**
- ⚠️ Environment variables need special handling
- ⚠️ Not ideal for backend API calls (CORS issues)

---

### **Option D: Railway.app (Recommended for Free Tier)**

Similar to Vercel, with good free tier and easy GitHub integration.

1. Go to https://railway.app
2. "New Project" → Connect GitHub
3. Select your repository
4. Configure environment variables
5. Auto-deploy on push

---

## ⚠️ Important: Environment Variables

### For Deployment:

**⚠️ NEVER commit your API key to GitHub!**

Your `.gitignore` already protects this, but verify:

```bash
# Check if .env is ignored
git status | grep ".env"
# Should show: nothing (file is ignored) ✅
```

### Add to Deployment Platform:

Each platform has a way to add environment variables:

**Vercel**: Settings → Environment Variables
**Netlify**: Site Settings → Build & Deploy → Environment
**Railway**: Add variables in the dashboard

**Required variables**:
```
GEMINI_API_KEY=your_actual_api_key_here
CUSTOM_MODEL_PATH=/models/breed_classifier
USE_CUSTOM_MODEL=true
FALLBACK_TO_GEMINI=true
```

---

## 🎯 Pre-Deployment Checklist

Before deploying, verify:

- ✅ `.gitignore` includes `.env` and `*.pth`
- ✅ `GEMINI_API_KEY` is in `.env` (not committed)
- ✅ Build works locally: `npm run build`
- ✅ No TypeScript errors: `npm run dev` works
- ✅ All paths use `/models/` (public path)
- ✅ README.md is updated with deployment info
- ✅ `vite.config.ts` configured correctly
- ✅ `package.json` has all dependencies

---

## 📝 Recommended README Update

Add this to your README.md for GitHub visibility:

```markdown
## 🚀 Live Demo

[View Live App](https://pashu-vision.vercel.app) (if deployed)

## 🛠️ Installation & Development

\`\`\`bash
# Clone the repository
git clone https://github.com/USERNAME/pashu-vision.git
cd pashu-vision

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit `http://localhost:5174/`

## 🔧 Build & Deploy

\`\`\`bash
# Production build
npm run build

# Preview production build locally
npm run preview
\`\`\`

## 📋 Environment Setup

1. Create `.env.local` file:
\`\`\`
GEMINI_API_KEY=your_api_key_here
USE_CUSTOM_MODEL=true
CUSTOM_MODEL_PATH=/models/breed_classifier
FALLBACK_TO_GEMINI=true
\`\`\`

2. Never commit `.env` file!

## 🌐 Deployed On

- **Vercel**: [pashu-vision.vercel.app](https://pashu-vision.vercel.app)
- Or your deployment URL here

## 📚 Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed folder organization.
```

---

## 🚀 Quick Start Commands

### Upload to GitHub (First time):
```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/pashu-vision.git
git add .
git commit -m "Initial commit: Pashu Vision AI"
git branch -M main
git push -u origin main
```

### Update on GitHub (Subsequent commits):
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Deploy to Vercel:
1. Visit https://vercel.com
2. "New Project" → Select repository → Deploy
3. Add environment variables
4. Done! ✅

---

## 📊 Deployment Comparison

| Platform | Cost | Setup | CORS | Best For |
|----------|------|-------|------|----------|
| **Vercel** | Free + Paid | 5 min | ✅ | React/Vite ⭐ |
| **Netlify** | Free + Paid | 5 min | ✅ | General |
| **GitHub Pages** | Free | 10 min | ⚠️ | Static sites |
| **Railway** | Free tier | 5 min | ✅ | Full stack |

---

## ✅ After Deployment

1. **Test the app** at your live URL
2. **Check Console** for errors (F12 → Console tab)
3. **Test breed identification** with a few images
4. **Test chat** functionality
5. **Verify voice commands** work

---

## 🎓 Next Steps

After deployment:

1. Share your GitHub link in your portfolio
2. Add to resume/CV
3. Consider adding CI/CD workflows
4. Monitor deployment analytics
5. Iterate and improve based on feedback

---

## 📞 Support

If deployment fails:

1. Check deployment platform logs
2. Verify environment variables are set
3. Ensure `.env` file exists locally but NOT in git
4. Check for TypeScript errors: `npm run build`
5. Clear build cache and redeploy

---

**You're ready to go! 🎉**

Your project is professional, organized, and deployment-ready!
