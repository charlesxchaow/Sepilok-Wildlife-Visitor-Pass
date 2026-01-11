
import { GoogleGenAI } from "@google/genai";

// We create the ai instance inside the functions to ensure we always use the latest API key from the environment
export const getWildlifeFact = async (attractionId: string): Promise<string> => {
  try {
    // Initialize GoogleGenAI right before the API call to capture the current process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

    // Directly access the .text property (it is a getter, not a function)
    return response.text?.trim() || "Nature is waiting to surprise you at Sepilok.";
  } catch (error) {
    console.error("Gemini Fact Error:", error);
    return "Remember to stay quiet and keep a safe distance from the wildlife for the best experience.";
  }
};

export const getTravelTip = async (date: string): Promise<string> => {
  try {
    // Initialize GoogleGenAI right before the API call to capture the current process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Give a very brief (10 words) travel advice for visiting Sepilok, Borneo on ${date}. Mention weather or gear.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    
    // Directly access the .text property (it is a getter, not a function)
    return response.text?.trim() || "Wear comfortable shoes and carry a reusable water bottle.";
  } catch (error) {
    return "Bring a raincoat and insect repellent for the jungle.";
  }
};
