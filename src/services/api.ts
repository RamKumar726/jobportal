import { GoogleGenAI, Type } from "@google/genai";

const API_BASE = "/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }
  return response.json();
}

// Gemini AI Service
export async function analyzeResume(resumeContent: any, jobDescription: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const prompt = `
      Analyze the following resume against the job description.
      
      Resume: ${JSON.stringify(resumeContent)}
      Job Description: ${jobDescription}
      
      Provide a JSON response with:
      1. atsScore: A number from 0-100.
      2. missingKeywords: Array of strings.
      3. skillGaps: Array of strings.
      4. weakSections: Array of strings.
      5. suggestions: Array of strings (actionable advice).
      6. feedback: A short paragraph summarizing the strength.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.NUMBER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakSections: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: { type: Type.STRING },
          },
          required: ["atsScore", "missingKeywords", "skillGaps", "weakSections", "suggestions", "feedback"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    
    // Handle rate limits or high traffic (429 errors)
    if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("limit")) {
      throw new Error("The AI service is currently busy due to high traffic. Please try again in a few minutes.");
    }
    
    throw new Error("AI Analysis failed. Please try again later.");
  }
}
