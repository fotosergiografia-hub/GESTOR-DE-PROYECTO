
import { GoogleGenAI } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// and use process.env.API_KEY directly.

export const getMotivationalMessage = async (action: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un mensaje motivacional corto y profesional (máximo 10 palabras) para un empleado que acaba de realizar la siguiente acción: "${action}". El mensaje debe ser alentador pero serio, no infantil.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Guideline: .text is a property, not a method.
    return response.text || "Trabajo completado con éxito.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente trabajo, continúa así.";
  }
};

export const getAdminInsights = async (metricsData: any): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un consultor senior de gestión de equipos. Analiza los siguientes datos de rendimiento operativo de la Papelería de la 18 y proporciona 3 puntos clave (insights) breves y profesionales para la gerencia. Datos: ${JSON.stringify(metricsData)}. Enfócate en eficiencia, cuellos de botella y sugerencias de mejora sin ser punitivo.`,
    });
    // Guideline: .text is a property, not a method.
    return response.text || "No hay insights disponibles en este momento.";
  } catch (error) {
    return "El equipo mantiene un ritmo constante de trabajo.";
  }
};
