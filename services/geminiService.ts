
import { GoogleGenAI, Type } from "@google/genai";
import { getSystemInstruction } from '../constants';
import { Business, BusinessGenome, MatchResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ... (Keep existing generateBusinessAdvice)
export const generateBusinessAdvice = async (query: string, chatHistory: string[], language: string = 'ar'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let prompt = '';
    if (language === 'ar') {
       prompt = `
      تاريخ المحادثة:
      ${chatHistory.join('\n')}
      
      سؤال المستخدم الحالي: ${query}
      
      قدم إجابة مفيدة وموجزة بصفتك مستشار أعمال خبير في منصة مطورو الاعمال.
      `;
    } else if (language === 'es') {
       prompt = `
      Historial de chat:
      ${chatHistory.join('\n')}
      
      Pregunta actual del usuario: ${query}
      
      Proporcione una respuesta útil y concisa como consultor de negocios experto en la plataforma Business Developers.
      `;
    } else {
      prompt = `
      Chat History:
      ${chatHistory.join('\n')}
      
      Current User Question: ${query}
      
      Provide a helpful and concise answer as an expert business consultant on the Business Developers platform.
      `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        temperature: 0.7,
      }
    });

    return response.text || "Error";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

// ... (Keep existing generateMarketingPitch)
export const generateMarketingPitch = async (businessName: string, category: string, language: string = 'ar'): Promise<string> => {
  try {
    let prompt = '';
    if (language === 'ar') {
      prompt = `اكتب وصفاً تسويقياً قصيراً وجذاباً (تغريدة واحدة) لشركة اسمها "${businessName}" تعمل في مجال "${category}".`;
    } else if (language === 'es') {
      prompt = `Escribe una descripción de marketing corta y atractiva (un tweet) para una empresa llamada "${businessName}" en la categoría "${category}".`;
    } else {
      prompt = `Write a short and catchy marketing pitch (one tweet) for a company named "${businessName}" in the "${category}" industry.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "Leading company in its field.";
  }
};

export interface AISearchResponse {
  ids: string[];
  filters: {
    status: 'all' | 'occupied' | 'available';
    categories: string[];
  };
}

// ... (Keep existing searchBusinessesWithAI)
export const searchBusinessesWithAI = async (query: string, businesses: Business[], language: string = 'ar'): Promise<AISearchResponse> => {
  try {
    const simplifiedData = businesses.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      category: b.category,
      services: b.services,
      isOccupied: b.isOccupied
    }));

    const categories = [...new Set(businesses.map(b => b.category).filter(c => c !== 'AVAILABLE'))];

    const prompt = `
      You are an intelligent search engine for the Business Developers District.
      Data: ${JSON.stringify(simplifiedData)}
      Available Categories: ${JSON.stringify(categories)}
      User Query: "${query}"
      Task: Analyze the user's query and return matching IDs and filters.
      Return JSON Object only: {"ids": [], "filters": {"status": "...", "categories": []}}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    return {
      ids: result.ids || [],
      filters: {
        status: result.filters?.status || 'all',
        categories: result.filters?.categories || []
      }
    };
  } catch (error) {
    console.error("AI Search Error:", error);
    return { ids: [], filters: { status: 'all', categories: [] } };
  }
};

// --- NEW: Business Genome Matching ---
export const generateBusinessMatches = async (myProfile: BusinessGenome, availableBusinesses: Business[], language: string = 'ar'): Promise<MatchResult[]> => {
  try {
    const simplifiedCandidates = availableBusinesses
        .filter(b => b.isOccupied && b.genomeProfile)
        .map(b => ({
           id: b.id,
           name: b.name,
           genome: b.genomeProfile
        }));

    const prompt = `
      You are the "Business Genome Matching Engine" for a digital business district.
      
      YOUR PROFILE (The User):
      ${JSON.stringify(myProfile)}
      
      CANDIDATE ECOSYSTEM (Potential Partners):
      ${JSON.stringify(simplifiedCandidates)}
      
      TASK:
      Analyze the compatibility between the "User" and the "Candidates" based on their Genome Profiles (Industry, Services Offered/Needed, Company Size, Collaboration Preferences).
      
      SCORING LOGIC:
      - High Score (80-100): Direct Supply/Demand match (e.g., User needs Marketing, Candidate offers Marketing) OR highly complementary industries.
      - Medium Score (60-79): Shared target markets or compatible company sizes for partnership.
      - Low Score (<60): Little obvious synergy.
      
      REQUIREMENTS:
      1. Return the TOP 6 matches.
      2. "matchReason" must be specific to the services/industries involved.
      3. "collaborationOpportunity" must be a concrete project idea (e.g., "Joint venture to enter the Saudi market", "Service exchange agreement").
      4. "analysisPoints" must explain the score using exactly 3 factors: "Industry Sector", "Services Synergy", and "Strategic Fit".
      
      Output Language: ${language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : 'English'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              companyId: { type: Type.STRING },
              score: { type: Type.NUMBER },
              matchReason: { type: Type.STRING },
              sharedInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
              collaborationOpportunity: { type: Type.STRING },
              analysisPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    factor: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              }
            },
            required: ['companyId', 'score', 'matchReason', 'collaborationOpportunity']
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text) as MatchResult[];

  } catch (error) {
    console.error("AI Matching Error:", error);
    return [];
  }
};

export const analyzeMapTrends = async (businesses: Business[], language: string = 'ar'): Promise<string> => {
  try {
    const occupiedBusinesses = businesses.filter(b => b.isOccupied);
    const total = businesses.length;
    const occupiedCount = occupiedBusinesses.length;
    
    // Enhanced data for prompt including grid position
    const businessData = occupiedBusinesses.map(b => ({
      name: b.name,
      category: b.category,
      visitors: b.activeVisitors || 0,
      location: `Grid(${b.gridPosition.x},${b.gridPosition.y})`
    }));

    const prompt = `
      You are an AI Analyst for a Digital Business District.
      
      District Data:
      - Total Spots: ${total}
      - Occupied: ${occupiedCount}
      - Businesses: ${JSON.stringify(businessData)}
      
      Task:
      Provide a brief, professional market analysis of the district in ${language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : 'English'}.
      
      Structure:
      1. **Current Status**: Occupancy rate, visitor traffic summary.
      2. **Trending Sectors**: Which categories are dominating?
      3. **Spatial Insights**: Are specific industries clustering in certain grid areas?
      4. **Opportunity**: What business type is missing?
      
      Keep it concise (max 180 words). Use clear formatting with bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("AI Trends Error:", error);
    return "Unable to generate insights at this time.";
  }
};

export interface ConsultingRecommendation {
  recommendedId: string;
  reasoning: string;
}

export const recommendConsultingService = async (query: string, language: string = 'ar'): Promise<ConsultingRecommendation> => {
  try {
    const prompt = `
      You are a senior strategic business advisor for the "Business Developers" digital district.
      
      Your Objective:
      Analyze the user's request to identify their underlying business challenges and long-term strategic goals. Based on this deep analysis, recommend the single most effective consulting service category.

      Available Service Categories:
      - cons_tech: Technology Strategy (Digital Transformation, AI adoption, IT infrastructure, Software Development).
      - cons_marketing: Growth & Brand (Market entry, SEO, Social Media, Brand positioning, Sales funnels).
      - cons_training: Human Capital Development (Leadership coaching, Team workshops, Skill upskilling).
      - cons_recruitment: Talent Solutions (Headhunting, HR structuring, Staffing, Org charts).
      - cons_gov: Legal & Compliance (Government relations, Licensing, Regulations, Intellectual Property).

      User Input: "${query}"

      Analysis Instructions:
      1. Challenge Identification: What is the immediate pain point or obstacle mentioned or implied?
      2. Goal Identification: What is the desired future state or long-term objective?
      3. Strategy Match: Which service category provides the bridge from the challenge to the goal?

      Output Requirements:
      - The "reasoning" must be insightful, explaining the connection between the identified challenge and the recommendation. Avoid generic responses.
      - Output Language: ${language === 'ar' ? 'Arabic' : language === 'es' ? 'Spanish' : 'English'}.

      Return strictly JSON:
      {
        "recommendedId": "cons_...",
        "reasoning": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : "{}";
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return { recommendedId: '', reasoning: '' };
  }
};
