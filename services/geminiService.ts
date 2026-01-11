
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getWildlifeFact = async (attractionId: string): Promise<string> => {
  try {
    const prompt = `Provide a single, fascinating, 20-word educational fact or tip for a tourist visiting ${
      attractionId === 'ORANGUTAN' ? 'Sepilok Orangutan Rehabilitation Centre' : 
      attractionId === 'SUNBEAR' ? 'Bornean Sun Bear Conservation Centre' : 'the Bornean rainforest'
    }. Keep it engaging and nature-focused.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Nature is waiting to surprise you at Sepilok.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Remember to stay quiet and keep a safe distance from the wildlife for the best experience.";
  }
};
