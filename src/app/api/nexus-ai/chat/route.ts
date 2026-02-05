import { NextResponse } from "next/server";
import { projects } from "@/data/projects";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ text: "Error: No se detectó la clave de API en el sistema." }, { status: 500 });
    }

    const projectsContext = projects.map(p => `- ${p.title}: ${p.description}`).join("\n");

    const systemPrompt = `Eres OpenAI 903, la inteligencia definitiva de Developer903.
    Creador: Ordasin.
    Contexto: ${projectsContext}
    Instrucciones: Eres brillante, técnico y siempre das soluciones de alto nivel.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5-exp",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text
          }))
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "El núcleo no devolvió datos.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ text: "Error de conexión con el núcleo OpenAI 903." }, { status: 500 });
  }
}
