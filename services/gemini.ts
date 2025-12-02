import { GoogleGenAI, Modality, Type } from "@google/genai";
import { playRawAudio } from "./audioUtils";

// Helper to get a fresh instance (important for Veo key switching)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * TEXT TO SPEECH
 * Uses gemini-2.5-flash-preview-tts
 */
export const speakText = async (text: string, voiceName: 'Puck' | 'Kore' | 'Fenrir' | 'Charon' | 'Zephyr' = 'Puck') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playRawAudio(base64Audio);
    }
  } catch (error) {
    console.error("TTS Error:", error);
    // Silent fail for UI interactions if audio fails, to not block the kid
  }
};

/**
 * STORY GENERATION
 * Uses gemini-2.5-flash
 */
export const generateStory = async (characterName: string, theme: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a very short, simple story (max 3 sentences) for a 5-year-old about a ${characterName} who loves ${theme}. Keep it happy and exciting.`,
  });
  return response.text || "Once upon a time...";
};

/**
 * PUZZLE GENERATION (Encryption/Logic for Kids)
 * Uses gemini-2.5-flash with JSON schema
 */
export const generatePuzzle = async (): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Create a visual pattern logic puzzle using EMOJIS only. The 'question' should be a sequence of emojis like '🍎 🍌 🍎 🍌 ❓'. The 'options' should be single emojis. The 'correctIndex' is the index of the answer in options. 'explanation' is a very short text explaining why.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

/**
 * IMAGE EDITING
 * Uses gemini-2.5-flash-image (Nano Banana)
 */
export const editImage = async (base64Image: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image Edit Error", e);
    throw e;
  }
};

/**
 * VIDEO GENERATION (VEO)
 * Uses veo-3.1-fast-generate-preview
 */
export const generateVeoVideo = async (
  prompt: string, 
  imageBytes?: string,
  mimeType: string = 'image/jpeg',
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string | null> => {
  const ai = getAI();
  
  let operation;
  const config = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: aspectRatio,
  };

  try {
    if (imageBytes) {
      // Image-to-Video
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || "Animate this image", 
        image: {
          imageBytes: imageBytes,
          mimeType: mimeType,
        },
        config: config
      });
    } else {
      // Text-to-Video
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: config
      });
    }

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      // Fetch with API key appended
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;

  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
};