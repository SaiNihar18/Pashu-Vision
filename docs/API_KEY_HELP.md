# Gemini API Key Setup

## Get a key

1. Open [Google AI Studio](https://aistudio.google.com/apikey)
2. Create or copy an API key (typically **39 characters**, starts with `AIzaSy`)

## Configure locally

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   ```
   GEMINI_API_KEY=your_full_key_here
   ```
3. Restart the dev server:
   ```bash
   npm run dev
   ```

## Production (Vercel / Netlify / etc.)

Add `GEMINI_API_KEY` in your host’s **Environment Variables** dashboard. Never commit `.env` to git.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| "No Gemini API key found" | Create `.env` from `.env.example` and set `GEMINI_API_KEY` |
| "Invalid Gemini API key: truncated" | Use the full 39-character key from AI Studio |
| Chat works locally but not deployed | Add `GEMINI_API_KEY` on the hosting platform and redeploy |

**Security:** Do not paste API keys into source code or documentation. Rotate any key that was ever committed publicly.
