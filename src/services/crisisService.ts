import { GoogleGenAI, Type } from "@google/genai";
import { FinancialAlert } from "../types";
import { storage } from "./storage";

export const crisisService = {
  generateAlerts: async (region: string): Promise<FinancialAlert[]> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Analyze the current global and regional financial landscape for ${region}.
        Identify any potential financial crises, significant inflation spikes, harmful financial cycles, or major economic downturns.
        Base your analysis on real-time patterns and economic research.
        
        Return a JSON array of FinancialAlert objects. 
        If no significant threats are found, return an empty array.
        
        Fields:
        - id: string (random)
        - type: 'crisis' | 'inflation' | 'cycle' | 'opportunity'
        - severity: 'low' | 'medium' | 'high' | 'critical'
        - title: string (short, impactful)
        - description: string (1-2 sentences explaining the threat and its impact)
        - actionLabel: string (e.g., "Learn More", "Protect Savings", "View Analysis")
        - actionUrl: string (a relevant news link or internal app route like "/news")
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['crisis', 'inflation', 'cycle', 'opportunity'] },
                severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                actionLabel: { type: Type.STRING },
                actionUrl: { type: Type.STRING }
              },
              required: ["id", "type", "severity", "title", "description", "actionLabel", "actionUrl"]
            }
          }
        }
      });

      const alerts: FinancialAlert[] = JSON.parse(response.text).map((a: any) => ({
        ...a,
        createdAt: Date.now()
      }));

      if (alerts.length > 0) {
        storage.saveAlerts(alerts);
      }
      
      return alerts;
    } catch (error) {
      console.error('Failed to generate financial alerts:', error);
      return [];
    }
  },

  getCachedAlerts: (region: string): FinancialAlert[] => {
    const cached = storage.getAlerts();
    if (cached && Date.now() - cached.timestamp < 6 * 60 * 60 * 1000) { // 6 hours cache
      return cached.alerts;
    }
    return [];
  }
};
