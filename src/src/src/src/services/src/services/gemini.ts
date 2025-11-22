import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const moderateContent = async (text: string): Promise<{ allowed: boolean; reason: string }> => {
  // Safety fallback for viral load
  if (!process.env.API_KEY) {
    return { allowed: true, reason: "Safe mode" };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze text for harmful/hate speech. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            allowed: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["allowed", "reason"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return { allowed: result.allowed, reason: result.reason };
    }
    return { allowed: true, reason: "Auto-approved" };
  } catch (error) {
    // IMPORTANT: Fail open (allow post) if AI quota exceeded to not block users
    return { allowed: true, reason: "Service busy" };
  }
};
