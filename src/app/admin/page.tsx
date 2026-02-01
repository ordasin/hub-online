'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, Trash2, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
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

      // 1. Alarma Global (Notificación)
      g.get('GLOBAL_ALARM').on((data: any) => {
        if (data && data.time > Date.now() - 20000) {
          toast.error("¡INTRUSIÓN DETECTADA!", { 
            description: `${data.type} detectado en la red`,
            duration: 10000
          });
        }
      });

      // 2. Historial Stream (Lista)
      g.get('FINAL_THREAT_STREAM').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            return [{ ...data, id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 rounded-[3rem] bg-red-900/10 border-2 border-red-600/20 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
                <Shield size={48} className="text-red-600 animate-pulse" />
                <h1 className="text-4xl font-black uppercase tracking-tighter">Command Unit</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-500 text-[10px] font-black uppercase">
                <Wifi size={12}/> Red Escuchando
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase flex items-center gap-2"><Activity size={18} /> Threat History</h2>
            <div className="space-y-2">
              <AnimatePresence>
                {threats.map((t) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <AlertTriangle size={16} className="text-red-500" />
                      <p className="text-red-500 font-black text-xs uppercase">{t.type}</p>
                    </div>
                    <p className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {threats.length === 0 && <p className="text-center py-10 text-gray-700 uppercase text-xs font-black">Silencio en la red...</p>}
            </div>
          </div>
        </div>
        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-purple-600 hover:text-white transition-all">Panel Hub</button>
      </div>
    </main>
  )
}
