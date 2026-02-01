'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
        webRTC: false
      });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // 1. ESCUCHA DE SEÑAL RÁPIDA (Para el aviso Toast)
      g.get('ORDASIN_QUICK_SIGNAL').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error("!!! AMENAZA EN VIVO !!!", { 
            description: data.details || "Ataque detectado",
            duration: 10000
          });
          
          // Forzar inclusión en la lista si no está
          setLogs(prev => {
            if (prev.find(l => l.id === data.id)) return prev;
            return [{ ...data }, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
          });
        }
      });

      // 2. ESCUCHA DE HISTORIAL (Para la lista persistente)
      g.get('ORDASIN_V3_CORE').map().on((data: any, id: string) => {
        if (data && data.time) {
          setLogs(prev => {
            if (prev.find(l => l.id === data.id)) return prev;
            return [{ ...data, id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
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
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <Shield size={40} className="text-red-600 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-widest text-white">Security Command</h1>
          </div>
          <button onClick={() => gun.get('ORDASIN_V3_CORE').put(null)} className="p-4 bg-white/5 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl transition-all border border-white/10"><Trash2 size={24}/></button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2 mb-6"><Activity size={14}/> Live Intrusion Stream</h2>
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {logs.map((l) => (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={l.id || l.time} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                  <div className="flex gap-4 items-center">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-red-400 font-black text-xs uppercase tracking-tighter">{l.type || 'ALERT'}</span>
                    <span className="text-gray-500 text-[10px] truncate max-w-xs">{l.details}</span>
                  </div>
                  <span className="text-white font-black text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">{new Date(l.time).toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">Escaneando red en busca de intrusos...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
