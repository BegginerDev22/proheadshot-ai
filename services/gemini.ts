import { GoogleGenAI } from "@google/genai";

/**
 * Generates a professional headshot edit based on the user's uploaded image and selected style.
 * Uses the 'gemini-2.5-flash-image' model as per requirements ("Nano banana" powered).
 */
export const generateHeadshot = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string
): Promise<string> => {
  // Always use process.env.API_KEY directly when initializing the client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Clean the base64 string if it contains the data URL prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this image. ${prompt} Ensure the result is a high-quality, realistic professional headshot. Maintain the person's facial identity but upgrade the clothing and background to match the description.`,
          },
        ],
      },
      // Note: responseMimeType and responseSchema are NOT supported for gemini-2.5-flash-image
    });

    // Iterate through parts to find the image part
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image part found, check for text indicating refusal or error
    const textPart = parts.find(p => p.text);
    if (textPart) {
        throw new Error(`Model returned text instead of image: ${textPart.text}`);
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};