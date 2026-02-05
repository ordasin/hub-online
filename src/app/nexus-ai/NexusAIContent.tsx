'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, Brain, 
  Activity, Loader2, Database, Cpu, ShieldCheck, Globe, Sparkles,
  Command, ChevronRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function NexusAIContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState('Sincronizando flujos neuronales...');
  const [thinkingProcess, setThinkingProcess] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setStatus('Online');
      setMessages([{
        id: 'welcome',
        role: 'ai',
        text: '[OpenAI 903 Core Online] Bienvenido a la terminal de inteligencia absoluta. He sincronizado mi base de datos global con capacidad GPT-4o. Puedo ayudarte con optimización, seguridad, dudas técnicas o cualquier consulta general. ¿Por dónde empezamos?',
        time: new Date().toLocaleTimeString()
      }]);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const newMessage: Message = { id: Date.now().toString(), role: 'user', text: userText, time: new Date().toLocaleTimeString() };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
    setThinkingProcess('Analizando intención con OpenAI 903...');

    try {
      const response = await fetch('/api/nexus-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      if (!response.ok) throw new Error('Falló la conexión neuronal.');

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.text,
        time: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Error en la conexión con OpenAI 903. Por favor, reintenta la secuencia.',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
      setThinkingProcess('');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        
        {!isLoaded && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center animate-pulse mb-8 shadow-[0_0_60px_rgba(37,99,235,0.5)]">
              <Brain size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Desplegando OpenAI 903</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">{status}</p>
            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} />
            </div>
          </div>
        )}

        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg relative group">
              <Bot size={28} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">OpenAI <span className="text-blue-500">903</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={10} className="text-blue-500" /> Neural Engine: OpenAI 903 Turbo
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-8 opacity-30 text-[8px] font-black uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2"><ShieldCheck size={12}/> AI Cloud</span>
             <span className="flex items-center gap-2"><Globe size={12}/> Global Sync</span>
             <span className="flex items-center gap-2"><Cpu size={12}/> Real-time Brain</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-6 rounded-[2rem] text-[14px] leading-relaxed shadow-xl whitespace-pre-line ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none shadow-black/50'}`}>
                      {m.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="text-white font-black">{part}</b> : part)}
                    </div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest px-2">{m.time} • OpenAI 903 Secure</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex flex-col gap-2 ml-16">
              <div className="flex gap-2 items-center">
                <Loader2 size={12} className="animate-spin text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 animate-pulse">{thinkingProcess}</span>
              </div>
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
              placeholder="Ordena a OpenAI 903..." 
              className="flex-1 bg-black border-2 border-white/5 rounded-2xl py-6 px-8 text-sm focus:border-blue-500/50 outline-none font-bold disabled:opacity-50 transition-all placeholder:text-gray-800" 
            />
            <button onClick={handleSend} disabled={!isLoaded || isTyping} className="px-10 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-blue-500 hover:text-white transition-all shadow-xl disabled:opacity-50">Enviar</button>
          </div>
        </footer>
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/[0.02] rounded-full blur-[180px] -z-10 animate-pulse"></div>
    </main>
  );
}
