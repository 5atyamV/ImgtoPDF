import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey });

/**
 * Converts a File object to a base64 string suitable for Gemini API.
 */
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a concise caption for an image using Gemini 2.5 Flash.
 */
export const generateImageCaption = async (file: File): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  try {
    const imagePart = await fileToPart(file);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { text: "Analyze this image and provide a clear, concise, professional caption (max 20 words) suitable for a PDF document. Do not include phrases like 'This image shows'. Just the description." }
        ]
      }
    });

    return response.text?.trim() || "No caption generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate caption");
  }
};