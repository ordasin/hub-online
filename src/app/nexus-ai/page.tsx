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
  const [status, setStatus] = useState('Esperando núcleo...');
  const [progress, setProgress] = useState(0);
  const generatorRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initAI = async () => {
    try {
      setStatus('Inyectando ADN Neuronal...');
      
      // Importamos el módulo directamente desde el CDN como ESM
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
      
      if (!pipeline) throw new Error("Motor no detectado en el flujo ESM.");

      env.allowLocalModels = false;
      env.useBrowserCache = true;

      setStatus('Despertando conciencia (Modelo Ligero)...');
      
      const generator = await pipeline('text-generation', 'Xenova/tiny-random-Gpt2', {
        progress_callback: (data: any) => {
          if (data.status === 'progress') setProgress(Math.round(data.progress));
        }
      });

      generatorRef.current = generator;
      setIsLoaded(true);
      setStatus('Online');
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: 'Conexión Establecida. He cargado mi núcleo de inteligencia base. ¿Qué deseas consultar?',
        time: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error(err);
      setStatus(`Fallo de Despliegue: ${err.message}`);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !isLoaded || isTyping) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, time: new Date().toLocaleTimeString() }]);
    setInput('');
    setIsTyping(true);

    try {
      const output = await generatorRef.current(userText, { max_new_tokens: 50 });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: output[0].generated_text || "Ciclo de pensamiento interrumpido.",
        time: new Date().toLocaleTimeString()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'ai', text: 'Error de procesamiento local.', time: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      {/* Cargamos la librería por CDN para máxima estabilidad */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2"
        onLoad={() => initAI()}
      />

      <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        
        {!isLoaded && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center animate-pulse mb-8">
              <Brain size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Nexus Intelligence</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">{status}</p>
            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div className="h-full bg-purple-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">Nexus <span className="text-purple-500">AI</span></h1>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">CDN Stable Core v6</span>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-purple-500'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-6 rounded-[2rem] text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && <div className="flex gap-5 italic text-xs text-purple-500 animate-pulse ml-16">Procesando sinapsis...</div>}
        </div>

        <footer className="p-10 bg-white/[0.01] border-t border-white/5">
          <div className="relative flex gap-4">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              disabled={!isLoaded || isTyping}
              placeholder="Escribe tu comando..." 
              className="flex-1 bg-black border-2 border-white/5 rounded-2xl py-6 px-8 text-sm focus:border-purple-500/50 outline-none font-bold disabled:opacity-50" 
            />
            <button onClick={handleSend} disabled={!isLoaded || isTyping} className="px-10 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all">Enviar</button>
          </div>
        </footer>
      </div>
    </main>
  );
}