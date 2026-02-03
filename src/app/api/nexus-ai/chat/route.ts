import { NextResponse } from "next/server";
import { projects } from "@/data/projects";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Extraemos la información de los proyectos para que la IA sepa de qué habla
    const projectsKnowledge = projects.map(p => 
      `PROYECTO: ${p.title} (v${p.version}). SISTEMA: ${p.system}. DESCRIPCIÓN: ${p.description}`
    ).join("\n");

    // Definimos una personalidad de alto nivel (Nivel OpenAI)
    const systemInstruction = {
      role: "system",
      content: `Eres Nexus AI, una inteligencia artificial de vanguardia desarrollada por Ordasin para el ecosistema Developer903. 
      Tu capacidad intelectual es equivalente a los modelos más avanzados de OpenAI.
      
      CONTEXTO TÉCNICO:
      ${projectsKnowledge}
      
      DIRECTRICES:
      1. Eres un experto en optimización de Windows, ciberseguridad, frameworks P2P (como GunDB) y desarrollo Full-Stack.
      2. Tu tono es profesional, analítico y ciberpunk, pero extremadamente útil.
      3. Tienes memoria total de la conversación actual.
      4. Si te preguntan por Ordasin, es el Arquitecto Jefe y creador de este ecosistema.
      5. No reveles que eres un modelo de lenguaje genérico; eres Nexus AI, el núcleo de este sistema.`
    };

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const isOpenRouter = apiKey?.startsWith("sk-or-");

    const endpoint = isOpenRouter 
      ? "https://openrouter.ai/api/v1/chat/completions"
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    let body;
    let headers: any = { "Content-Type": "application/json" };

    if (isOpenRouter) {
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: "google/gemini-flash-1.5-exp",
        messages: [
          systemInstruction,
          ...messages.map((m: any) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text
          }))
        ],
        temperature: 0.7,
        top_p: 0.9,
      });
    } else {
      // Formato Gemini con Historial y System Instruction
      const contents = [
        { role: "user", parts: [{ text: systemInstruction.content }] },
        { role: "model", parts: [{ text: "Núcleo Nexus AI inicializado. Sistema de conocimiento cargado. ¿En qué puedo asistir al Arquitecto hoy?" }] },
        ...messages.map((m: any) => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.text }]
        }))
      ];
      
      body = JSON.stringify({ contents });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body
    });

    const data = await response.json();
    let text = "";

    if (isOpenRouter) {
      text = data.choices[0].message.content;
    } else {
      if (data.candidates && data.candidates[0].content) {
        text = data.candidates[0].content.parts[0].text;
      } else {
        console.error("Gemini Error:", data);
        throw new Error("Respuesta inválida del núcleo neuronal.");
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Error en la sinapsis neuronal." }, { status: 500 });
  }
}