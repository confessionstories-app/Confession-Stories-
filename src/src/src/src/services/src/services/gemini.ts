import { GoogleGenAI, Type } from "@google/genai";

// Check for key in Vite format (import.meta.env) or standard format
const apiKey = import.meta.env.VITE_API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const moderateContent = async (text: string): Promise<{ allowed: boolean; reason: string }> => {
  if (!apiKey) {
    console.warn("Gemini API Key missing. Allowing content with warning (Dev Mode).");
    return { allowed: true, reason: "Dev mode" };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following confession text for harmful, explicit, hate speech, or bullying content. 
      It is for a public anonymous board. Strict safety is required.
      Text: "${text}"`,
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
    
    return { allowed: true, reason: "Auto-approved (AI busy)" };
  } catch (error) {
    console.error("Moderation error:", error);
    return { allowed: true, reason: "Service busy, posted anyway" };
  }
};
