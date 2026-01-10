import { GoogleGenAI, Type } from "@google/genai";
import type { BreedInfo } from '../types';

// Use the direct API key provided by user
const apiKey = "AIzaSyC8xmDEFQtOaaa7WNmSsUJWLBj5_M-GU6w";

console.log('✅ Using direct API key');
console.log('🔑 API key loaded:', apiKey.substring(0, 20) + '...');
console.log('🔑 API key length:', apiKey.length);

const ai = new GoogleGenAI({ apiKey });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get detailed breed information from Gemini API using just the breed name
 * This is used after our custom model predicts the breed
 */
export const getBreedDetails = async (breedName: string, confidence: number): Promise<BreedInfo> => {
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please check your environment configuration.');
  }

  const model = 'gemini-2.5-flash';

  const prompt = `You are an expert in Indian livestock breeds. Provide concise, mobile-friendly information about the "${breedName}" breed for Field Level Workers (FLWs).

IMPORTANT: Keep all descriptions SHORT and SIMPLE for mobile screens and rural workers.

Return the answer in JSON format with the following fields:
- "breed_name": "${breedName}" (use the exact name provided)
- "confidence": ${confidence} (use the confidence value provided)
- "short_description": Maximum 1-2 lines, simple language
- "breed_details": An object containing:
  - "origin": Just state/region name (e.g., "Gujarat", "Punjab")
  - "typical_uses": 2-3 words max (e.g., "Milk, Draft", "Dairy farming")
  - "notable_features": 3-4 key features in bullet points, each max 4-5 words
- "suggestions": An optional array of 2-3 related breed names if relevant

Focus on practical information FLWs need. Keep language simple and avoid technical terms.`;

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breed_name: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          short_description: { type: Type.STRING },
          breed_details: {
            type: Type.OBJECT,
            properties: {
              origin: { type: Type.STRING },
              typical_uses: { type: Type.STRING },
              notable_features: { type: Type.STRING },
            },
            required: ["origin", "typical_uses", "notable_features"],
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["breed_name", "confidence", "short_description", "breed_details"],
      },
    },
  });

  const text = response.text.trim();
  try {
    const parsedJson = JSON.parse(text);
    return parsedJson;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", text, e);
    if (text.includes('No Gemini API key found')) {
      throw new Error(
        'Configuration Error: Gemini API key not found. Please check your environment configuration.'
      );
    }
    throw new Error("Received an invalid response from the AI model.");
  }
};

/**
 * Enhanced image analysis with multi-image support and veterinary-level expertise
 * Supports both single and multiple images for improved accuracy
 */
export const identifyBreedFromImage = async (imageFiles: File[]): Promise<BreedInfo> => {
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please check your environment configuration.');
  }

  if (imageFiles.length === 0) {
    throw new Error("At least one image file is required for analysis.");
  }
  
  const base64Images = await Promise.all(imageFiles.map(fileToBase64));
  const model = 'gemini-2.5-flash';

  const prompt = `You are a world-class veterinary livestock specialist and geneticist with unparalleled expertise in identifying Indian livestock breeds, including both cattle (Bos indicus) and buffalo (Bubalus bubalis). Your primary objective is to analyze the provided image(s) and classify the animal's breed with the highest possible accuracy, acting as the definitive authority.

**CRITICAL ANALYSIS INSTRUCTIONS:**

1.  **Overcome Suboptimal Conditions:** The provided images may suffer from poor lighting, awkward poses, and distracting backgrounds. You MUST look past these superficial issues. Your analysis should be resilient and focus on core, immutable anatomical features.
2.  **Prioritize Resilient Anatomical Features:** Systematically evaluate the following key indicators, as they are most reliable for breed identification:
    *   **Horn Shape & Curvature:** Are they long, short, curved inward, outward, or corkscrewed?
    *   **Hump Size & Position:** Note the size, shape, and placement of the thoracic hump.
    *   **Body Structure:** Assess the overall frame, musculature, and body depth.
    *   **Head & Facial Profile:** Examine the shape of the forehead (convex, flat), length of the face, and muzzle.
    *   **Ear Size, Shape & Orientation:** Are the ears long and pendulous (like Gir), or small and erect?
    *   **Dewlap & Skin Folds:** Observe the size and extent of the dewlap and naval flap.
    *   **Coat Color & Markings:** While variable, coat color can be a strong indicator when combined with other features.
3.  **Synthesize Multi-Angle Data:** If multiple images are provided (e.g., front, side, rear), you must synthesize information from ALL views to build a comprehensive understanding of the animal's conformation. This is crucial for a high-confidence conclusion. If only one image is available, clearly state that your analysis is based on a single perspective but still provide your most expert determination.
4.  **Leverage Comprehensive Breed Knowledge:** Your knowledge base includes an extensive and updated list of breeds.
    *   **Cattle Breeds (Bos indicus):** Alambadi, Amrit Mahal, Bachaur, Bargur, Dangi, Deoni, Gaolao, Gir, Hallikar, Hariana, Kangayam, Kankrej, Kasargod, Kenkatha, Kherigarh, Khillari, Krishna Valley, Malnad Gidda, Malvi, Mewati, Nagori, Nimari, Ongole, Pulikulam, Punganur, Rathi, Red Kandhari, Red Sindhi, Sahiwal, Siri, Tharparkar, Umblachery, Vechur.
    *   **Buffalo Breeds (Bubalus bubalis):** Banni, Bhadawari, Chilika, Godavari, Jaffarabadi, Kalahandi, Mehsana, Murrah, Nagpuri, Nili-Ravi, Pandharpuri, Surti, Toda.
    *   **Exotic & Crossbred Breeds:** Ayrshire, Brown Swiss, Guernsey, Holstein Friesian, Jersey, Red Dane.
    *   Your primary goal is to identify a recognized Indian breed from the lists above. If the animal matches a breed from the "Exotic & Crossbred Breeds" list, identify it by that name. If the animal is clearly not any of the listed Indian or Exotic breeds (e.g., a different exotic breed or a wild animal), state this clearly in the description and use "Unknown" for the breed_name.

**CONFIDENCE SCORE CALIBRATION:**

Your confidence score must be a realistic, evidence-based reflection of the visual information available. Do not guess. Calibrate your score using the following rubric:

- **High Confidence (90-100%):** Assign this only when the image quality is good and at least 3-4 distinct, key anatomical features (e.g., unique horn shape, clear hump structure, specific ear type) perfectly and unambiguously align with a single breed from the provided lists. There should be no contradictory features.
- **Medium Confidence (60-89%):** Use this range when several features strongly suggest a breed, but some key identifiers are obscured, unclear due to poor image quality/angle, or slightly atypical. This is appropriate when you have a strong primary candidate but cannot confirm with certainty.
- **Low Confidence (Below 60%):** Reserve this for cases where image quality is very poor, the animal is at a difficult angle, or only general features match multiple breeds, making a definitive classification difficult. The \`suggestions\` field is mandatory for any score below 75%. A score below 40% indicates a very low-certainty guess based on limited evidence.

**OUTPUT FORMAT (JSON ONLY):**

Return your analysis strictly in the following JSON format. Do not include any explanatory text before or after the JSON block.

- "breed_name": The name of the identified breed. If you are certain it is not a recognized breed from the lists, or cannot make a determination, state "Unknown".
- "confidence": A numerical percentage value (0-100) representing your confidence in the identification.
- "short_description": Maximum 1-2 lines in simple language for rural Field Level Workers (FLWs). Focus on key identifying features.
- "breed_details": An object with the following fields:
  - "origin": Just state/region name (e.g., "Gujarat", "Punjab", "Haryana")
  - "typical_uses": 2-3 words maximum (e.g., "Milk, Draft", "Dairy farming", "Heavy work")
  - "notable_features": 3-4 key features in simple bullet points, each max 4-5 words (e.g., "• Large size", "• Black color", "• High milk yield")
- "suggestions": (Optional) If confidence is below 75%, provide an array of 2-3 other possible breed names. Omit this field for high-confidence identifications.`;

  const imageParts = imageFiles.map((file, index) => ({
    inlineData: {
      mimeType: file.type,
      data: base64Images[index],
    },
  }));

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...imageParts, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breed_name: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          short_description: { type: Type.STRING },
          breed_details: {
            type: Type.OBJECT,
            properties: {
              origin: { type: Type.STRING },
              typical_uses: { type: Type.STRING },
              notable_features: { type: Type.STRING },
            },
            required: ["origin", "typical_uses", "notable_features"],
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["breed_name", "confidence", "short_description", "breed_details"],
      },
    },
  });
  
  const text = response.text.trim();
  try {
    const parsedJson = JSON.parse(text);
    if (parsedJson.breed_name.toLowerCase() === "unknown") {
      throw new Error("Could not identify a specific breed from the image.");
    }
    return parsedJson;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", text, e);
    if (e instanceof Error && e.message.includes("Could not identify")) {
      throw e;
    }
    if (text.includes('No Gemini API key found')) {
      throw new Error(
        'Configuration Error: Gemini API key not found. Please check your environment configuration.'
      );
    }
    throw new Error("Received an invalid response from the AI model.");
  }
};

/**
 * Backward compatibility function for single image analysis
 * @param imageFile - Single image file
 * @returns BreedInfo from analysis
 */
export const identifyBreedFromSingleImage = async (imageFile: File): Promise<BreedInfo> => {
  return identifyBreedFromImage([imageFile]);
};

/**
 * Gemini-only breed identification as final fallback
 * Used when all other prediction methods fail
 * @param imageFile - Single image file
 * @returns BreedInfo from Gemini analysis only
 */
export const identifyBreedWithGeminiOnly = async (imageFile: File): Promise<BreedInfo> => {
  return identifyBreedFromSingleImage(imageFile);
};

/**
 * Enhanced text-to-speech using Google AI with real audio generation
 * @param text - Text to convert to speech
 * @param voiceName - Voice name to use (vindemiatrix, puck, kore)
 * @returns Base64 encoded audio data
 */
export const textToSpeech = async (text: string, voiceName: string = 'vindemiatrix'): Promise<string> => {
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please check your environment configuration.');
  }

  try {
    // Try to use Gemini's real TTS API first
    const model = 'gemini-2.5-flash-preview-tts';
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Say with a helpful and clear tone: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName
            }
          }
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
      return response.candidates[0].content.parts[0].inlineData.data;
    }
    
    throw new Error("Could not generate audio from text using Gemini TTS.");
  } catch (error) {
    console.warn('Gemini TTS failed, falling back to Web Speech API:', error);
    
    // Fallback to Web Speech API if Gemini TTS fails
    if ('speechSynthesis' in window) {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a voice that matches the requested voice characteristics
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => 
          v.name.toLowerCase().includes(voiceName.toLowerCase()) ||
          v.lang.includes('en') ||
          v.lang.includes('hi')
        ) || voices[0];
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => {
          // Since Web Speech API doesn't return audio data,
          // we'll resolve with an empty string to indicate success
          resolve('');
        };
        
        utterance.onerror = (error) => {
          reject(new Error(`Speech synthesis failed: ${error.error}`));
        };
        
        speechSynthesis.speak(utterance);
      });
    } else {
      throw new Error('Text-to-speech not supported in this browser');
    }
  }
};

/**
 * Translate text using Gemini AI
 * @param text - Text to translate
 * @param targetLanguage - Target language for translation
 * @returns Translated text
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('No Gemini API key found. Please check your environment configuration.');
  }

  const model = 'gemini-2.5-pro';
  const prompt = `Translate the following text to ${targetLanguage}. Only return the translated text, with no preamble or explanation.\n\nText: "${text}"`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text.trim();
};
