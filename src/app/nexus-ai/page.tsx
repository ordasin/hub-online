'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, User, Sparkles, 
  Terminal, ShieldCheck, Zap,
  Brain, Globe, Database, Activity,
  Download, Loader2, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Definición de tipos
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
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Esperando inicialización...');
  const [pipeline, setPipeline] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAI = async () => {
      setStatus('Descargando Núcleo Neuronal (Cerebro Real)...');
      try {
        // Importación dinámica para evitar problemas de SSR en Next.js
        const { pipeline, env } = await import('@xenova/transformers');
        
        // Configuración para ejecución en navegador
        env.allowLocalModels = false;
        
        // Cargamos un modelo ligero pero inteligente (LaMini-GPT-124M)
        // Este modelo es real y puede razonar sobre casi cualquier tema.
        const generator = await pipeline('text-generation', 'Xenova/LaMini-GPT-124M', {
          progress_callback: (data: any) => {
            if (data.status === 'progress') {
              setProgress(Math.round(data.progress));
              setStatus(`Sincronizando Sinapsis: ${Math.round(data.progress)}%`);
            }
          }
        });

        setPipeline(() => generator);
        setIsLoaded(true);
        setStatus('Sistemas al 100%');
        
        setMessages([{
          id: 'welcome',
          role: 'ai',
          text: 'Conexión Neuronal Establecida. He cargado mi base de datos de conocimiento universal. Puedes preguntarme sobre programación, ciencia, el HUB o cualquier duda que tengas. ¿Por dónde empezamos?',
          time: new Date().toLocaleTimeString()
        }]);
      } catch (err) {
        console.error(err);
        setStatus('Error crítico en el despliegue del núcleo.');
      }
    };

    loadAI();
  }, []);

  useEffect(() => {
    if (scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !isLoaded || isTyping) return;

    const userText = input;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // PROCESO DE GENERACIÓN REAL (IA trabajando en el navegador)
      const output = await pipeline(userText, {
        max_new_tokens: 150,
        temperature: 0.7,
        repetition_penalty: 1.2,
        do_sample: true,
      });

      const aiResponse = output[0].generated_text || "Mi red neuronal ha sufrido una interferencia. ¿Podrías repetir?";
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'ai',
        text: 'Error en el ciclo de pensamiento. Mi procesador local está saturado.',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono overflow-hidden">
      <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white/[0.02] border border-white/10 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
        
        {/* Cargador de Inteligencia (Solo se ve al principio) */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center animate-pulse mb-8 shadow-[0_0_60px_rgba(147,51,234,0.5)]">
              <Brain size={48} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Desplegando Inteligencia Real</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">{status}</p>
            
            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-12 text-[8px] text-white/20 uppercase max-w-xs leading-loose">
              Estamos descargando un modelo de lenguaje real directamente a tu memoria RAM. Esta operación solo ocurre la primera vez.
            </p>
          </div>
        )}

        {/* Header de la Terminal */}
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg relative group">
              <Bot size={28} className="text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-black animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Nexus <span className="text-purple-500">AI</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={10} className="text-purple-500" /> Neural Engine: Absolute V6
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
             <StatBox icon={<Database size={12}/>} label="Model" value="LaMini-124M" />
             <StatBox icon={<Cpu size={12}/>} label="Compute" value="Browser GPU" />
          </div>
        </header>

        {/* Zona de Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-purple-500'}`}>
                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`p-6 rounded-[2rem] text-[14px] leading-relaxed shadow-xl whitespace-pre-line ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                    <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest px-2">{m.time} • Local Processing</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
              <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center text-purple-500">
                <Bot size={18} />
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-3 shadow-2xl">
                <Loader2 size={16} className="animate-spin text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 animate-pulse">Generando pensamiento...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input del Usuario */}
        <footer className="p-10 bg-white/[0.01] border-t border-white/5">
          <div className="relative group">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              disabled={!isLoaded || isTyping}
              placeholder={isLoaded ? "Pregunta lo que quieras al cerebro de Nexus..." : "Iniciando cerebro..."} 
              className="w-full bg-black border-2 border-white/5 rounded-2xl py-6 pl-8 pr-24 text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-800 font-bold disabled:opacity-50" 
            />
            <button 
              onClick={handleSend}
              disabled={!isLoaded || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
            >
              Consultar
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-10 opacity-20 text-[8px] font-black uppercase tracking-widest">
             <span className="flex items-center gap-2"><ShieldCheck size={12}/> 100% Offline AI</span>
             <span className="flex items-center gap-2"><Globe size={12}/> No Cloud Needed</span>
             <span className="flex items-center gap-2"><Sparkles size={12}/> GPT-class Architecture</span>
          </div>
        </footer>
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/[0.03] rounded-full blur-[180px] -z-10"></div>
    </main>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-[7px] font-black text-gray-600 uppercase mb-1">
        {icon} {label}
      </div>
      <div className="text-[10px] font-black italic text-white">{value}</div>
    </div>
  );
}
