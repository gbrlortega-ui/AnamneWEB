
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function refineMedicalText(text: string, sectionName: string, patientType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Aja como um preceptor de medicina experiente especializado em ${patientType}. 
      Melhore a redação médica do texto da seção "${sectionName}" de uma anamnese, 
      mantendo a fidelidade aos fatos mas utilizando terminologia técnica adequada e estrutura semiológica clássica pertinente à idade do paciente.
      Não invente dados novos, apenas refine o texto: \n\n${text}`,
      config: {
        temperature: 0.2,
      },
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini refinement error:", error);
    return text;
  }
}

export async function getClinicalSuggestions(qd: string, hma: string, patientType: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: Paciente ${patientType}. Queixa: "${qd}". História: "${hma}". 
      Sugira 5 perguntas semiológicas cruciais que o estudante não deve esquecer para este perfil de idade.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    try {
        return JSON.parse(response.text || "[]");
    } catch {
        return [];
    }
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return [];
  }
}
