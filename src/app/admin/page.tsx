'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, Trash2, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const RELAY = 'https://gun-manhattan.herokuapp.com/gun';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [netLog, setNetLog] = useState<string[]>([])

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun({ peers: [RELAY] });
      
      gun.on('hi', () => {
        setPeers(p => p + 1);
        setNetLog(prev => ["Conectado a Relé Central", ...prev].slice(0, 5));
      });

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        // Emitir latido de Admin para que los otros navegadores nos encuentren
        setInterval(() => {
          gun.get('ADMIN_HEARTBEAT').put({ active: true, time: Date.now() });
        }, 3000);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // ESCUCHA DE AMENAZAS UNIFICADA
      gun.get('HUB_SECURITY_CORE').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            
            if (data.time > Date.now() - 20000) {
              toast.error("!!! AMENAZA EXTERNA DETECTADA !!!", {
                description: `${data.type} desde ${data.browser || 'Browser'}`,
                duration: 10000
              });
            }
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
    }, 500);
    return () => clearInterval(check);
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-8 border border-red-600/20 bg-red-950/5 rounded-3xl flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <ShieldAlert size={40} className="text-red-600 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Security Monitor</h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>Red P2P: {peers > 0 ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LOGS */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Amenazas en Tiempo Real</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                                <div>
                                    <p className="text-red-500 font-black text-xs uppercase">{t.type}</p>
                                    <p className="text-gray-500 text-[9px] mt-1 font-bold">{t.details}</p>
                                </div>
                            </div>
                            <span className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl text-gray-700 text-xs font-black uppercase tracking-widest animate-pulse">Monitorizando red global...</div>}
                </div>
            </div>

            {/* CONSOLA DE RED */}
            <div className="p-8 rounded-[2.5rem] bg-black border border-white/5 space-y-6">
                <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest"><Terminal size={14}/> Network Feed</h2>
                <div className="space-y-2">
                    {netLog.map((log, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {log}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} Escuchando paquetes...</p>
                </div>
                <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase hover:bg-purple-600 hover:text-white transition-all">Ir al Escritorio</button>
            </div>
        </div>
      </div>
    </main>
  )
}