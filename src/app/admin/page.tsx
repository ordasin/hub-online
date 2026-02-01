'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const GLOBAL_RELAYS = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://peer.wall.org/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ peers: GLOBAL_RELAYS, localStorage: true });
      
      // Monitor de conexión de alta precisión
      checkInterval = setInterval(() => {
        try {
          const mesh = g.back('opt.peers');
          const connected = Object.keys(mesh).filter(k => mesh[k].wire && mesh[k].wire.readyState === 1).length;
          setPeers(connected);
        } catch(e) {}
      }, 2000);

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('GLOBAL_MONITOR_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) {
              toast.error("! AMENAZA DETECTADA !", { description: data.details });
            }
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(loader);
      }
    }, 500);

    return () => {
      clearInterval(loader);
      clearInterval(checkInterval);
    };
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="p-8 border-2 border-red-600/30 bg-red-950/10 rounded-[2.5rem] flex justify-between items-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <Shield size={40} className="text-red-600 animate-pulse" />
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic">Vigilante Hub</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">Security Master Node</p>
            </div>
          </div>
          <div className="px-6 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black uppercase flex items-center gap-3 relative z-10">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-bounce" : "text-red-500"}/>
            <span>Red P2P: {peers > 0 ? `SINCRONIZADA (${peers})` : 'BUSCANDO NODOS...'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-4 tracking-[0.4em]"><Activity size={14}/> Threat Intelligence Feed</h2>
          <div className="grid grid-cols-1 gap-2">
            <AnimatePresence initial={false}>
                {threats.map((t) => (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="px-3 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase">Alert</div>
                        <p className="text-[10px] font-bold text-gray-400 truncate max-w-md">{t.details}</p>
                    </div>
                    <span className="text-white font-black text-[10px] opacity-50">{new Date(t.time).toLocaleTimeString()}</span>
                </motion.div>
                ))}
            </AnimatePresence>
            {threats.length === 0 && (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-[3rem]">
                    <p className="text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escaneando red en busca de firmas de ataque...</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}