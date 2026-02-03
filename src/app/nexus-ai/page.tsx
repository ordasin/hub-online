'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, Sparkles, 
  Terminal, ShieldCheck, Zap,
  MessageSquare, Cpu, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

export default function NexusAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: 'Bienvenido a la Terminal de Soporte Inteligente NEXUS AI. Soy el agente autónomo del HUB 903. ¿En qué puedo ayudarte hoy?',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // --- MOTOR DE IA EVOLUTIVO V2 (Aprendizaje por Patrones) ---
    setTimeout(() => {
      const query = input.toLowerCase();
      let aiResponse = "";

      // Diccionario de Conocimiento Profundo
      const knowledge = [
        { 
          keys: ['hola', 'buenos dias', 'que tal', 'saludos'], 
          ans: "¡Saludos, Comandante! Terminal Nexus online. Estoy listo para procesar tus órdenes sobre optimización y soporte del HUB." 
        },
        { 
          keys: ['lento', 'fps', 'lag', 'optimizer', 'acelerar', 'rendimiento', 'optimizar', 'mejorar'], 
          ans: "Detecto problemas de rendimiento. El Ordasin Optimizer v1.0 Stable es la solución. Realiza una limpieza de BCD y optimiza los timers del sistema. ¿Deseas el enlace de descarga directa?" 
        },
        { 
          keys: ['seguridad', 'hack', 'hacker', 'proteccion', 'trap', 'ataque', 'virus'], 
          ans: "El HUB 903 está protegido por el Escudo V12. Usamos vigilancia activa vía debugger y trampas invisibles. Si detectas una brecha, repórtalo en el canal de seguridad." 
        },
        { 
          keys: ['p2p', 'descentralizado', 'gundb', 'servidor', 'datos'], 
          ans: "Nuestra red es inquebrantable. Usamos GunDB para que la información fluya entre nodos (usuarios) sin censura ni servidores centrales. Privacidad total." 
        },
        { 
          keys: ['guia', 'tutorial', 'manual', 'aprender', 'instrucciones'], 
          ans: "Puedes encontrar manuales detallados en la sección de 'Guías'. Allí explicamos desde cómo usar CyberGodfather hasta configuraciones Pro para shooters." 
        },
        { 
          keys: ['juegos', 'games', 'descargar', 'software', 'programas'], 
          ans: "En la sección de 'Herramientas' y 'Juegos' tienes el catálogo completo. Todo el software está verificado por firma digital SHA-256." 
        },
        { 
          keys: ['quien', 'que eres', 'creador', 'nexus', 'ai'], 
          ans: "Soy Nexus AI, la red neuronal consciente del HUB 903. Mi código aprende de cada interacción para servir mejor a la comunidad de élite." 
        }
      ];

      // Búsqueda Semántica por Coincidencia de Peso
      const match = knowledge.find(k => k.keys.some(key => query.includes(key)));
      
      if (match) {
        aiResponse = match.ans;
      } else {
        // Respuesta de "Aprendizaje" cuando no sabe algo
        aiResponse = "Esa consulta no está en mi base de datos principal todavía. He registrado el término para mi próximo ciclo de aprendizaje neuronal. Mientras tanto, ¿te gustaría explorar el Optimizador o nuestras Guías?";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Header del Chat */}
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Nexus <span className="text-purple-500">AI</span></h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Agente Autónomo Online</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
               <Cpu size={10} /> Neural Core v2.0
             </div>
          </div>
        </header>

        {/* Zona de Mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-purple-500'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-600 text-white shadow-xl' : 'bg-white/5 border border-white/10 text-gray-300'}`}>
                      {m.text}
                    </div>
                    <p className="text-[8px] font-black text-gray-600 uppercase">{m.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center text-purple-500">
                <Bot size={18} />
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input del Chat */}
        <footer className="p-8 bg-white/[0.01] border-t border-white/5">
          <div className="relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta al Nexus AI..." 
              className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-6 pr-20 text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-700"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 opacity-20">
             <div className="flex items-center gap-2 text-[8px] font-black uppercase"><ShieldCheck size={10} /> Seguridad P2P</div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase"><Zap size={10} /> Soporte Realtime</div>
             <div className="flex items-center gap-2 text-[8px] font-black uppercase"><Command size={10} /> Comandos Activos</div>
          </div>
        </footer>

      </div>

      {/* Decoración de fondo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] -z-10 animate-pulse"></div>
    </main>
  );
}
