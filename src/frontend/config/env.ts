/**
 * Build-time environment values injected by Vite (see vite.config.ts).
 * Set GEMINI_API_KEY in a `.env` file at the project root for local dev.
 */
export const GEMINI_API_KEY: string =
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

export function requireGeminiApiKey(): string {
  const key = GEMINI_API_KEY.trim();
  if (!key) {
    throw new Error(
      'No Gemini API key found. Add GEMINI_API_KEY to your .env file (see .env.example).'
    );
  }
  if (key.length < 39) {
    throw new Error(
      'Invalid Gemini API key: key appears truncated. Valid keys are ~39 characters. Get one at https://aistudio.google.com/apikey'
    );
  }
  return key;
}
