'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, User, Sparkles,
  Terminal, ShieldCheck, Zap,
  MessageSquare, Cpu, Command,
  Brain, Globe, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function NexusAIPage() {
  const [user, setUser] = useState<any>(null);
  const [gun, setGun] = useState<any>(null);
  const [worldNews, setWorldNews] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initNexus = async () => {
      // 1. Sincronización P2P
      const Gun = (window as any).Gun;
      if (!Gun) return;
      const g = Gun(['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun']);
      setGun(g);
      const u = g.user().recall({ sessionStorage: true });
      setUser(u);

      // 2. Inteligencia de Actualidad
      try {
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = await res.json();
        const newsItems = await Promise.all(ids.slice(0, 3).map(async (id: number) => {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const item = await itemRes.json();
          return item.title;
        }));
        setWorldNews(newsItems);
      } catch {} // Silently ignore errors for now

      const welcome = u.is 
        ? `[Neural Core V4 Online] Bienvenido, Comandante **${u.is.alias}**. Mi núcleo neuronal está sincronizado con la red global. ¿Qué sistema vamos a optimizar hoy?`
        : `[Protocolo Invitado] Terminal de Inteligencia V4 activa. No detecto firma digital, pero tengo acceso a los flujos de datos del HUB. ¿Cuál es tu consulta?`;
      
      setMessages([{ id: 'welcome', role: 'ai', text: welcome, time: new Date().toLocaleTimeString() }]);
    };

    const checker = setInterval(() => { if ((window as any).Gun) { initNexus(); clearInterval(checker); } }, 500);
    return () => clearInterval(checker);
  }, []);

  useEffect(() => {
    if (scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }
  }, [messages, isTyping]);

  const processQuery = (query: string) => {
    const q = query.toLowerCase();
    
    // 1. Respuestas de Grok/ChatGPT style (Con conocimiento expandido)
    if (q.includes('noticias') || q.includes('mundo') || q.includes('pasa')) {
      return `Analizando flujos globales... Aquí tienes los 3 vectores de información más potentes ahora mismo:\n\n` + 
             worldNews.map((n, i) => `**${i+1}.** ${n}`).join('\n') + 
             `\n\n¿Quieres que profundice en alguno de estos nodos?`;
    }

    if (q.includes('optimizer') || q.includes('fps') || q.includes('rendimiento') || q.includes('lento')) {
      return `Tu hardware está pidiendo auxilio. El **Ordasin Optimizer v1.0** es la herramienta definitiva.\n\n` +
             `- **Acción recomendada:** Limpiar registro y optimizar BCD.\n` +
             `- **Resultado esperado:** Reducción de latencia y +20% FPS.\n\n` +
             `¿Quieres el enlace de despliegue directo?`;
    }

    if (q.includes('seguridad') || q.includes('hacker') || q.includes('ataque')) {
      return `Estamos operando bajo el **Escudo de Vigilancia V12**. He detectado y bloqueado múltiples intentos de intrusión hoy.\n\n` +
             `*Estado del Sistema:* **INEXPUGNABLE**. ¿Quieres ver los logs de los últimos 'invasores'?`;
    }

    if (q.includes('quien eres') || q.includes('que eres') || q.includes('creador')) {
      return `Soy **Nexus AI V4**, la evolución de la red neuronal del HUB 903. Mi arquitectura combina lógica determinista con aprendizaje semántico P2P.\n\n` +
             `Mi objetivo: Maximizar el potencial digital de cada usuario del HUB.`;
    }

    if (q.includes('si') || q.includes('vale') || q.includes('ok') || q.includes('procede')) {
      return `Afirmativo. Ejecutando protocolo solicitado. Estoy listo para el siguiente comando.`;
    }

    if (q.includes('no') || q.includes('negativo')) {
      return `Recibido. Abortando operación. Mi núcleo permanece en modo de espera.`;
    }

    // 2. Respuesta por defecto inteligente
    return `Esa consulta está fuera de mi base de datos inmediata. He registrado el patrón para mi próximo ciclo de entrenamiento.\n\n` +
           `Mientras tanto, puedo ayudarte con el **Optimizer**, la **Seguridad** o las **Noticias del Mundo**. ¿Qué prefieres?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulación de "Procesamiento Mental"
    const stages = ["Accediendo a la red P2P...", "Analizando intención...", "Sincronizando con Neural Core..."];
    let i = 0;
    const thinkingInterval = setInterval(() => {
      setThinkingProcess(stages[i]);
      i++;
      if (i >= stages.length) clearInterval(thinkingInterval);
    }, 400);

    setTimeout(() => {
      const response = processQuery(userMsg.text);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: response, time: new Date().toLocaleTimeString() }]);
      setIsTyping(false);
      setThinkingProcess('');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      <div className="max-w-4xl mx-auto h-[75vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        
        {/* Header Pro */}
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.4)]">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">Nexus <span className="text-purple-500">AI</span></h1>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] rounded border border-purple-500/30 font-black">CORE V4</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sistemas Cognitivos Operativos</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="flex flex-col items-end">
               <span className="text-[8px] text-gray-600 font-black uppercase">Uptime</span>
               <span className="text-xs font-black italic">99.99%</span>
             </div>
             <div className="w-[1px] h-8 bg-white/10"></div>
             <div className="flex flex-col items-end">
               <span className="text-[8px] text-gray-600 font-black uppercase">Net</span>
               <span className="text-xs font-black italic">P2P_MESH</span>
             </div>
          </div>
        </header>

        {/* Zona de Mensajes con Formateo Inteligente */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: m.role === 'ai' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white shadow-lg' : 'bg-black border-white/10 text-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.1)]'}`}>
                    {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-6 rounded-[2rem] text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white shadow-2xl' : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                      {m.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="text-white font-black">{part}</b> : part)}
                    </div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">{m.time} • {m.role === 'ai' ? 'Neural Response' : 'User Command'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-purple-500 animate-pulse">
                  <Bot size={20} />
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
              <p className="text-[10px] text-purple-500/50 font-black uppercase ml-16 italic animate-pulse">{thinkingProcess}</p>
            </motion.div>
          )}
        </div>

        {/* Input Maestro */}
        <footer className="p-8 bg-white/[0.01] border-t border-white/5">
          <div className="relative group">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Escribe tu comando al Nexus AI V4..." className="w-full bg-black border border-white/10 rounded-2xl py-6 pl-8 pr-24 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-700 font-bold" />
            <button onClick={handleSend} className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all shadow-xl">ENVIAR</button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-10 opacity-20">
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"><Globe size={12} /> Global Intelligence</div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"><Database size={12} /> P2P Memory</div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"><Command size={12} /> NLP Engine V4</div>
          </div>
        </footer>
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/[0.03] rounded-full blur-[180px] -z-10 animate-pulse"></div>
    </main>
  );
}
