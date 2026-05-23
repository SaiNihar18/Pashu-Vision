import type { BreedInfo } from '../types';

export type ChatMessage = { role: 'user' | 'model'; text: string };

type GeminiResponse = {
  error?: string;
  message?: string;
  text?: string;
  audioData?: string;
};

const GEMINI_API_BASE = (import.meta.env.VITE_GEMINI_API_BASE || '').replace(/\/$/, '');
const GEMINI_ENDPOINT = `${GEMINI_API_BASE}/api/gemini`;

const postGemini = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    if (!text) {
      throw new Error('Gemini proxy is unavailable. Run `npx vercel dev` or deploy the serverless API.');
    }
    try {
      const json = JSON.parse(text) as GeminiResponse;
      throw new Error(json.error || json.message || `Gemini request failed (${response.status})`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(text || `Gemini request failed (${response.status})`);
    }
  }

  if (!text) {
    throw new Error('Gemini proxy returned an empty response.');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const getBreedDetails = async (breedName: string, confidence: number): Promise<BreedInfo> => {
  return postGemini<BreedInfo>({
    action: 'breedDetails',
    breedName,
    confidence,
  });
};

export const identifyBreedFromImage = async (imageFiles: File[]): Promise<BreedInfo> => {
  if (imageFiles.length === 0) {
    throw new Error('At least one image file is required for analysis.');
  }

  const base64Images = await Promise.all(imageFiles.map(fileToBase64));
  const images = base64Images.map((data, index) => ({
    mimeType: imageFiles[index].type || 'image/jpeg',
    data,
  }));

  const result = await postGemini<BreedInfo>({
    action: 'identifyBreed',
    images,
  });

  if (result.breed_name.toLowerCase() === 'unknown') {
    throw new Error('Could not identify a specific breed from the image.');
  }

  return result;
};

export const identifyBreedFromSingleImage = async (imageFile: File): Promise<BreedInfo> => {
  return identifyBreedFromImage([imageFile]);
};

export const identifyBreedWithGeminiOnly = async (imageFile: File): Promise<BreedInfo> => {
  return identifyBreedFromSingleImage(imageFile);
};

export const textToSpeech = async (text: string, voiceName: string = 'vindemiatrix'): Promise<string> => {
  try {
    const response = await postGemini<GeminiResponse>({
      action: 'tts',
      text,
      voiceName,
    });

    if (response.audioData) {
      return response.audioData;
    }
  } catch (error) {
    console.warn('Gemini TTS failed, falling back to Web Speech API:', error);
  }
  return '';
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const response = await postGemini<GeminiResponse>({
    action: 'translate',
    text,
    targetLanguage,
  });

  if (!response.text) {
    throw new Error('Translation failed.');
  }

  return response.text;
};

export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  const response = await postGemini<GeminiResponse>({
    action: 'chat',
    messages,
  });

  if (!response.text) {
    throw new Error('Chat response was empty.');
  }

  return response.text;
};
