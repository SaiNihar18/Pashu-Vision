# ✅ Pre-Deployment Checklist

## Before GitHub Upload

- [ ] `.gitignore` includes `.env` and `*.pth` files
- [ ] No API key is visible in code files
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` works perfectly
- [ ] No console errors in browser (F12)
- [ ] Breed identification works
- [ ] Chat functionality works
- [ ] All 9 languages load correctly

## Before Production Deployment

### Code Quality
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All imports are correct
- [ ] Components render without errors
- [ ] Mobile responsive tested
- [ ] No hardcoded API keys in code

### Configuration
- [ ] `vite.config.ts` is correct
- [ ] `tsconfig.json` is correct
- [ ] `package.json` has all dependencies
- [ ] Build output folder is `dist/`
- [ ] Environment variables documented

### GitHub
- [ ] Repository created on GitHub
- [ ] All code pushed (except `.env`, `node_modules/`)
- [ ] README.md is descriptive
- [ ] `.gitignore` is preventing secrets

### Deployment Platform (Vercel/Netlify/etc)

#### Environment Variables Set:
- [ ] `GEMINI_API_KEY` = your actual key
- [ ] `CUSTOM_MODEL_PATH` = `/models/breed_classifier`
- [ ] `USE_CUSTOM_MODEL` = `true`
- [ ] `FALLBACK_TO_GEMINI` = `true`

#### Build Configuration:
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18+ (recommended)

### Post-Deployment Testing
- [ ] [ ] App loads without errors
- [ ] [ ] Home page renders correctly
- [ ] [ ] Quick Analysis page works
- [ ] [ ] Can upload and analyze images
- [ ] [ ] Breed identification returns results
- [ ] [ ] Chat page works
- [ ] [ ] Voice commands function
- [ ] [ ] Language switching works
- [ ] [ ] No 404 errors for assets
- [ ] [ ] API calls work correctly

## File Size Considerations

Check before deploying (some platforms have size limits):

```bash
# Check build size
npm run build
# Check dist folder size
du -sh dist/

# For Vercel: limit ~50MB
# For Netlify: limit ~100MB
# For GitHub Pages: limit ~1GB
```

## Commands to Run

```bash
# Final verification before upload
npm run build
npm run preview  # Test production build locally

# Upload to GitHub
git add .
git commit -m "Final production release"
git push origin main

# Then deploy on your chosen platform
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` again, check Node version (18+) |
| 404 on images | Check vite.config.ts base path |
| API calls fail | Verify GEMINI_API_KEY in environment variables |
| CORS errors | Check if API allows requests from your domain |
| Large bundle | Check if node_modules excluded from build |
| Styling broken | Verify Tailwind CDN link in index.html |

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/
- Vite Docs: https://vitejs.dev/
- React Docs: https://react.dev/

---

✅ Check all items before deploying!
