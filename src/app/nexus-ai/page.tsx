'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, Brain, 
  Activity, Loader2, Database, Cpu, ShieldCheck, Globe, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function NexusAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState('Sincronizando sabiduría...');
  const [progress, setProgress] = useState(0);
  const generatorRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // BASE DE CONOCIMIENTO MAESTRA (Lo que la hace "Saber de Todo")
  const MASTER_KNOWLEDGE = [
    { 
      keys: ['optimizer', 'fps', 'rendimiento', 'lento', 'acelerar', 'pc'], 
      ans: "El Ordasin Optimizer v1.0 Stable es la cúspide de la optimización. Modifica los parámetros BCD (Boot Configuration Data) y los timers de alta resolución de Windows para reducir el input lag a casi cero. Debes ejecutarlo como administrador para inyectar los registros de baja latencia." 
    },
    { 
      keys: ['seguridad', 'hack', 'hacker', 'ataque', 'trap', 'vigilancia'], 
      ans: "Operamos bajo el Escudo V12. Detectamos aperturas de consola por latencia de debugger y monitoreamos clics derechos. Cualquier payload malicioso en la URL es interceptado por nuestro WAF de parámetros. Somos inexpugnables." 
    },
    { 
      keys: ['p2p', 'descentralizado', 'gundb', 'anonimato'], 
      ans: "Nuestra infraestructura no depende de servidores centrales. Usamos la red Mesh de GunDB para sincronizar estados entre usuarios de forma cifrada y anónima. Tu identidad es una firma criptográfica inmutable." 
    },
    { 
      keys: ['quien eres', 'nexus', 'inteligencia', 'chatgpt', 'grok'], 
      ans: "Soy la Absolute Intelligence del HUB 903. Mi arquitectura combina una red neuronal GPT local con una base de datos de conocimiento experto en ingeniería de sistemas y ciberseguridad." 
    },
    {
      keys: ['ayuda', 'instalar', 'guia', 'tutorial'],
      ans: "Para cualquier herramienta, descarga el .zip de nuestra sección de 'Software', extráelo y busca el ejecutable. Tenemos guías Pro en la sección '/guides' para configurar CS2, Valorant y Fortnite al máximo rendimiento."
    }
  ];

  const initAI = async () => {
    try {
      setStatus('Sincronizando flujos neuronales...');
      
      // Importación nativa desde node_modules (Evita bloqueos de CDN)
      const Transformers = await import('@xenova/transformers');
      const { pipeline, env } = Transformers;
      
      if (!pipeline) throw new Error("Motor no detectado.");

      // Configuración de Confianza Total
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      setStatus('Despertando Cerebro Maestro...');
      
      const generator = await pipeline('text-generation', 'Xenova/gpt2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') setProgress(Math.round(data.progress));
        }
      });

      generatorRef.current = generator;
      setIsLoaded(true);
      setStatus('Sistemas Online');
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: 'Conexión Neuronal Establecida. Mi base de datos de conocimiento universal está sincronizada. ¿Qué sistema vamos a analizar hoy?',
        time: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: El navegador bloqueó la conexión neuronal.`);
    }
  };

  useEffect(() => {
    initAI();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !isLoaded || isTyping) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, time: new Date().toLocaleTimeString() }]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const query = userText.toLowerCase();
      let aiResponse = "";

      // 1. INTELIGENCIA EXPERTA (Búsqueda semántica en base de datos)
      const expertMatch = MASTER_KNOWLEDGE.find(k => k.keys.some(key => query.includes(key)));
      
      if (expertMatch) {
        aiResponse = expertMatch.ans;
      } else {
        // 2. RAZONAMIENTO NEURONAL (Si no está en la base, usa la IA)
        try {
          const output = await generatorRef.current(userText, { 
            max_new_tokens: 60,
            temperature: 0.7,
            do_sample: true
          });
          aiResponse = output[0].generated_text.replace(userText, '').trim();
          if (!aiResponse) aiResponse = "He procesado tu comando, pero la respuesta requiere un nivel de autorización mayor. ¿Hablamos de optimización?";
        } catch (e) {
          aiResponse = "Interferencia detectada en el procesamiento. ¿Deseas que busquemos en el directorio del HUB?";
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString()
      }]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        
        {!isLoaded && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center animate-pulse mb-8 shadow-[0_0_60px_rgba(147,51,234,0.5)]">
              <Brain size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Nexus Alpha Core</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">{status}</p>
            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div className="h-full bg-gradient-to-r from-purple-600 to-blue-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative">
              <Bot size={28} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Nexus <span className="text-purple-500">AI</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={10} className="text-purple-500" /> Hybrid Intelligence: Active
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-10 opacity-30 text-[8px] font-black uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2"><ShieldCheck size={12}/> Secure Link</span>
             <span className="flex items-center gap-2"><Globe size={12}/> Global Knowledge</span>
             <span className="flex items-center gap-2"><Cpu size={12}/> Local Processing</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.1)]'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-6 rounded-[2rem] text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none shadow-xl'}`}>
                      {m.text}
                    </div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest px-2">{m.time} • Local Logic</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-5 items-center ml-16">
              <Loader2 size={14} className="animate-spin text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 animate-pulse">Analizando flujos neuronales...</span>
            </div>
          )}
        </div>

        <footer className="p-10 bg-white/[0.01] border-t border-white/5">
          <div className="relative flex gap-4">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              disabled={!isLoaded || isTyping}
              placeholder={isLoaded ? "Ordena al Nexus AI..." : "Iniciando cerebro..."} 
              className="flex-1 bg-black border-2 border-white/5 rounded-2xl py-6 px-8 text-sm focus:border-purple-500/50 outline-none font-bold disabled:opacity-50 transition-all" 
            />
            <button onClick={handleSend} disabled={!isLoaded || isTyping} className="px-10 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all shadow-xl disabled:opacity-50">Enviar</button>
          </div>
        </footer>
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/[0.02] rounded-full blur-[180px] -z-10 animate-pulse"></div>
    </main>
  );
}
