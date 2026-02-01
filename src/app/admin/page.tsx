'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      
      g.on('hi', () => setConnected(true));
      g.on('bye', () => setConnected(false));

      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // 1. ESCUCHA DE PULSO (Instantánea)
      g.get('HUB_ALARM_SYSTEM').on((data: any) => {
        if (data && data.time > Date.now() - 15000) {
          toast.error("!!! ALARMA DE INTRUSIÓN !!!", { 
            description: "Se ha detectado un ataque en tiempo real",
            duration: 8000
          });
          
          // Insertar en la lista visual inmediatamente
          setThreats(prev => {
            const exists = prev.find(t => t.time === data.time);
            if (exists) return prev;
            return [data, ...prev].slice(0, 20);
          });
        }
      });

      // 2. ESCUCHA DE HISTORIAL (Persistente)
      g.get('HUB_HISTORY').map().on((data: any) => {
        if (data && data.time) {
          setThreats(prev => {
            const exists = prev.find(t => t.time === data.time);
            if (exists) return prev;
            return [data, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Connection Status */}
        <div className="flex justify-between items-center px-6 py-3 bg-white/5 border border-white/10 rounded-full">
            <div className="flex items-center gap-3">
                {connected ? <Wifi className="text-green-500" size={16}/> : <WifiOff className="text-red-500 animate-pulse" size={16}/>}
                <span className={`text-[10px] font-black uppercase tracking-widest ${connected ? 'text-green-500' : 'text-red-500'}`}>
                    {connected ? 'SISTEMA SINCRONIZADO' : 'BUSCANDO RED P2P...'}
                </span>
            </div>
            <p className="text-[9px] text-gray-600 font-bold">NODE_ALPHA_CORE</p>
        </div>

        <div className="p-10 rounded-[3rem] bg-red-950/5 border-2 border-red-900/20 backdrop-blur-xl">
          <div className="flex items-center gap-6 mb-12">
            <Shield size={48} className="text-red-600" />
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Vigilancia Hub</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.4em] mb-6 flex items-center gap-2"><Activity size={14}/> Threat Stream</h2>
            <div className="grid grid-cols-1 gap-2">
              <AnimatePresence initial={false}>
                {threats.map((t) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.time} className="p-4 bg-black border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-600/50 transition-all">
                    <div className="flex items-center gap-4">
                      <AlertTriangle size={16} className="text-red-600" />
                      <p className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza Detectada</p>
                    </div>
                    <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {threats.length === 0 && <p className="text-center py-20 text-gray-800 uppercase text-[10px] font-black animate-pulse tracking-[0.5em]">No se han detectado intrusos</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}