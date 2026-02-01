'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
        webRTC: false
      });
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        setIsLive(true);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar el canal unificado
      g.get('SECURITY_CHANNEL_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === data.id)) return prev;
            
            // Notificación instantánea
            if (data.time > Date.now() - 30000) {
              toast.error("¡NUEVA AMENAZA DETECTADA!", { description: "Revisa la lista de intrusiones" });
            }
            
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
        
        {/* NETWORK PULSE */}
        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem]">
            <div className="flex items-center gap-4">
                <Shield size={32} className={isLive ? "text-green-500" : "text-red-500"} />
                <h1 className="text-2xl font-black uppercase italic">VIGILANCIA V1</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isLive ? 'Red Sincronizada' : 'Desconectado'}</span>
            </div>
        </div>

        {/* THREAT LIST */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><Activity size={12}/> Live Threat Intelligence</h2>
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                    {threats.map((t) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={t.id || t.time} className="p-5 bg-red-900/10 border border-red-600/30 rounded-2xl flex justify-between items-center shadow-lg shadow-red-900/5">
                            <div className="flex items-center gap-4">
                                <AlertCircle className="text-red-500" size={20} />
                                <div>
                                    <p className="text-red-400 font-black text-xs uppercase tracking-tighter">Intrusión Detectada</p>
                                    <p className="text-gray-500 text-[10px] font-bold mt-1">Payload: {t.details}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</p>
                                <p className="text-red-900 font-black text-[8px] uppercase tracking-widest">Logged</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {threats.length === 0 && <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl"><p className="text-gray-700 text-xs font-black uppercase tracking-widest animate-pulse">Escaneando red P2P en busca de amenazas...</p></div>}
            </div>
        </div>

        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-purple-600 hover:text-white transition-all">Regresar</button>
      </div>
    </main>
  )
}