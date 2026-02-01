'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({
        peers: ['https://relay.gun.eco/gun'],
        localStorage: false
      });

      g.on('hi', () => setPeers(p => p + 1));
      
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // ESCUCHA CRÍTICA
      g.get('GLOBAL_MONITOR_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("! ALERTA DE SEGURIDAD !", { description: data.details });
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(check);
      }
    }, 1000);
    return () => clearInterval(check);
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-900/5 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-red-600 animate-pulse" />
            <h1 className="text-2xl font-black uppercase italic">Vigilante Maestro</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>Red P2P: {peers > 0 ? 'CONECTADA' : 'SIN SEÑAL'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-4"><Activity size={14}/> Threat Intelligence Feed</h2>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:border-red-500/50 transition-all">
                <span className="text-red-500 font-bold text-xs uppercase">{t.type || 'ATAQUE'}</span>
                <p className="text-[10px] text-gray-400 truncate max-w-md">{t.details}</p>
                <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Monitorizando...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
