
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getMotivationalMessage = async (action: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un mensaje motivacional corto y profesional (máximo 10 palabras) para un empleado que acaba de realizar la siguiente acción: "${action}". El mensaje debe ser alentador pero serio, no infantil.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Trabajo completado con éxito.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente trabajo, continúa así.";
  }
};

export const getTaskSummary = async (tasks: any[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resume el estado actual de estas tareas en una sola oración profesional para un reporte administrativo: ${JSON.stringify(tasks)}`,
    });
    return response.text || "Resumen no disponible.";
  } catch (error) {
    return "Progreso constante en los objetivos establecidos.";
  }
};
