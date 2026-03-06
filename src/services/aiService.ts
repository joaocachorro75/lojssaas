import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'groq' | 'modal';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export async function generateText(prompt: string, config: AIConfig): Promise<string> {
  if (!config.apiKey) throw new Error("API Key não configurada");

  try {
    switch (config.provider) {
      case 'gemini': {
        const genAI = new GoogleGenAI({ apiKey: config.apiKey });
        const response = await genAI.models.generateContent({
          model: config.model || "gemini-3-flash-preview",
          contents: prompt,
        });
        return response.text || "";
      }

      case 'openai': {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model || "gpt-4o",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      }

      case 'openrouter': {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model || "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      }

      case 'groq': {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model || "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      }

      case 'modal': {
        // Modal typically hosts custom models with OpenAI-compatible APIs
        // We assume the model name might contain the full URL if it's a custom deployment
        const endpoint = config.model?.startsWith('http') 
          ? config.model 
          : "https://api.modal.com/v1/chat/completions";
          
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model || "default",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "Erro na API da Modal");
        return data.choices[0].message.content;
      }

      default:
        throw new Error(`Provedor ${config.provider} não suportado ou em desenvolvimento.`);
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Erro ao gerar texto com IA");
  }
}
