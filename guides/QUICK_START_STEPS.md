# Pashu Vision — What To Do After the Fixes

Follow these steps in order.

---

## Step 1: Understand the error you saw

When you clicked **Analyze Image**, the app loaded **ONNX Runtime** (the engine that runs `breed_classifier.onnx`).

It was configured to load helper files from `/onnx-wasm/` inside the `public` folder. **Vite does not allow importing those files as JavaScript modules** from `public/`, so you got the red overlay:

> *This file is in /public and will be copied as-is during build without going through the plugin transforms...*

**Fix applied:** WASM now loads from a CDN via `src/frontend/config/onnxRuntime.ts`. The broken copies in `public/onnx-wasm/` were removed.

---

## Step 2: Restart the dev server

After any code change, restart Vite:

```powershell
cd "e:\Projects\PashuVision\breedai 2"

# Stop the old server (Ctrl+C in the terminal), then:
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

---

## Step 3: Check your `.env` file

You already have `.env`. Confirm:

```env
GEMINI_API_KEY=your_full_39_character_key_here
USE_CUSTOM_MODEL=true
CUSTOM_MODEL_PATH=/models/breed_classifier
FALLBACK_TO_GEMINI=true
```

| Check | Requirement |
|-------|-------------|
| Key length | **39 characters**, starts with `AIzaSy` |
| File name | `.env` in project root (same folder as `package.json`) |
| After editing | Restart `npm run dev` |

Get a new key: https://aistudio.google.com/apikey

Without a valid key, breed **details** and **chat** may fail (ONNX breed prediction can still run).

---

## Step 4: Confirm the ONNX model file exists

```powershell
(Get-Item "public\models\breed_classifier\breed_classifier.onnx").Length / 1MB
```

Expected: about **90** MB.

In the browser, this should return **200**:

`http://localhost:5173/models/breed_classifier/breed_classifier.onnx`

---

## Step 5: Test Quick Analysis

1. Home → **Quick Analysis** (or Image Capture card).
2. Upload a clear cattle/buffalo photo.
3. Click **Analyze Image**.
4. Wait 10–30 seconds (first run downloads WASM from CDN ~20 MB).

**Expected:** Breed name + confidence. No red Vite overlay.

**If ONNX fails:** App falls back to “intelligent predictor” (less accurate).

Open **F12 → Console** for logs starting with `🚀` / `✅` / `❌`.

---

## Step 6: Push code + model to GitHub (Git LFS)

Your model is ~90 MB — use **Git LFS**:

```powershell
cd "e:\Projects\PashuVision\breedai 2"
git lfs install
git add .gitattributes public/models/breed_classifier/breed_classifier.onnx
git add .
git commit -m "Fix ONNX WASM loading and project updates"
git push
```

Details: `docs/MODEL_GITHUB_LFS.md`

---

## Step 7: Deploy (Vercel / Netlify)

1. Connect your GitHub repo.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variables:
   - `GEMINI_API_KEY` = your full key
   - `USE_CUSTOM_MODEL` = `true`
   - `FALLBACK_TO_GEMINI` = `true`

Enable **Git LFS** on the host if the deployed site cannot load the model.

---

## Quick troubleshooting

| Problem | Solution |
|---------|----------|
| Red Vite overlay about `ort-wasm` | Restart dev server; pull latest code with `onnxRuntime.ts` fix |
| “No Gemini API key” | Fix `.env`, restart dev server |
| Model not found (404) | Ensure `breed_classifier.onnx` is under `public/models/breed_classifier/` |
| Slow first analysis | Normal — WASM downloads once from CDN |
| Works locally, not online | Set `GEMINI_API_KEY` on host; ensure LFS model is deployed |

---

## What was fixed in the codebase

- API keys moved to `.env` (not hardcoded)
- ONNX WASM path fixed (no more `/public/onnx-wasm/` import)
- Voice navigation from home screen
- History page field names
- Git LFS setup for the 90 MB model
- `.env.example`, favicon, translation keys
