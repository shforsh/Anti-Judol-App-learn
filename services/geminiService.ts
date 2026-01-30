
import { GoogleGenAI, Type } from "@google/genai";
import { SiteStatus, GamblingSite } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const performDiscovery = async (
  query: string, 
  knownPatterns: string[] = []
): Promise<{ sites: GamblingSite[]; sources: string[] }> => {
  
  // Prepare context from known patterns to guide the model
  const contextInstruction = knownPatterns.length > 0 
    ? `\n\nCONTEXTUAL KNOWLEDGE: We already know these patterns: [${knownPatterns.slice(0, 20).join(', ')}]. 
       Focus on finding NEW variations, different TLDs, or obfuscated versions of these, as well as entirely new platforms.`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for and extract gambling website names and identifiers commonly seen in live stream chat spam or donation messages in Indonesia. 
    Focus on specific brand names or domain-like strings (e.g., brandname.com, brandnamevip).
    Current Query: ${query}${contextInstruction}
    
    Rules:
    1. Extract the primary brand/site name.
    2. Normalize it (lowercase, no symbols).
    3. Assign a confidence score (0.0 - 1.0) based on how clearly it appears as a gambling platform.
    4. Provide the current timestamp.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extracted_sites: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                site_name: { type: Type.STRING },
                normalized_name: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER },
              },
              required: ["site_name", "normalized_name", "confidence_score"]
            }
          }
        },
        required: ["extracted_sites"]
      }
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web?.uri).filter(Boolean) as string[] || [];
  
  let result;
  try {
    result = JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    result = { extracted_sites: [] };
  }

  const timestamp = new Date().toISOString();
  const sites: GamblingSite[] = result.extracted_sites.map((site: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    site_name: site.site_name,
    normalized_name: site.normalized_name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    first_seen: timestamp,
    last_seen: timestamp,
    confidence_score: site.confidence_score,
    status: SiteStatus.ACTIVE,
    source_count: Math.floor(Math.random() * 5) + 1,
    sources: sources.slice(0, 3)
  }));

  return { sites, sources };
};
