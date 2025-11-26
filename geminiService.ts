import { GoogleGenAI, Type } from "@google/genai";
import { Activity, AIAnalysisResult } from "../types";

export const analyzeSchedule = async (activities: Activity[]): Promise<AIAnalysisResult> => {
  // Initialize client here to ensure we capture the latest process.env.API_KEY
  // This is crucial if the key is injected asynchronously
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return {
      summary: "API Key is missing. Cannot generate analysis.",
      tips: ["Please configure your API key to use AI features."],
      burnoutRisk: "Low"
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  if (activities.length === 0) {
    return {
      summary: "Your schedule is empty! Good time to relax or plan ahead.",
      tips: ["Add some activities to get started."],
      burnoutRisk: "Low"
    };
  }

  // Prepare concise data for the model
  const scheduleSummary = activities.map(a => 
    `- ${a.name} (${a.type}): ${a.date} at ${a.time} for ${a.durationMinutes}mins. Importance: ${a.baseScore}/10.`
  ).join('\n');

  const userPrompt = `
    Analyze the following schedule:
    ${scheduleSummary}

    Determine:
    1. A brief 1-2 sentence summary of their current workload.
    2. 3 specific, actionable tips to handle the highest priority items or conflicts.
    3. Assessment of burnout risk (Low, Medium, High).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "You are an academic advisor for a first-year university student. Provide a structured JSON response.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            burnoutRisk: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["summary", "tips", "burnoutRisk"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Could not analyze schedule at this time.",
      tips: ["Focus on your earliest deadline first.", "Take regular breaks."],
      burnoutRisk: "Low"
    };
  }
};