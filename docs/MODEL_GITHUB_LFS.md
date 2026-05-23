# Hosting the ONNX Model on GitHub (~90 MB)

GitHub rejects single files over **100 MB**. Your `breed_classifier.onnx` (~90 MB) must use **Git LFS**.

## One-time setup (on your machine)

```powershell
cd "e:\Projects\PashuVision\breedai 2"

# Install Git LFS if needed: https://git-lfs.com
git lfs install

# Track ONNX files (already configured in .gitattributes)
git lfs track "*.onnx"

# Add and commit the model via LFS
git add .gitattributes public/models/breed_classifier/breed_classifier.onnx
git commit -m "Add breed classifier ONNX model via Git LFS"
git push
```

## Clone on another machine

```bash
git lfs install
git clone <your-repo-url>
cd pashu-vision
git lfs pull
```

Verify the file is real binary (not a tiny LFS pointer):

```powershell
(Get-Item public\models\breed_classifier\breed_classifier.onnx).Length
# Should be ~94,000,000 bytes (~90 MB), not ~130 bytes
```

## Deploying (Vercel / Netlify / static host)

The model is served from `public/models/breed_classifier/breed_classifier.onnx`. Ensure your host:

1. Clones with **Git LFS** enabled (Vercel/Netlify support LFS on paid plans; check your plan).
2. Or upload the `.onnx` file to CDN/object storage and set `CUSTOM_MODEL_PATH` in env.

## Alternative: GitHub Release asset

If LFS bandwidth limits are a concern:

1. Upload `breed_classifier.onnx` to a [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github).
2. Add a download script (see `scripts/download-model.ps1`) for CI/local setup.
