'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, WifiOff, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [netLog, setNetLog] = useState<string[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: PEERS });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        setNetLog(prev => [...prev, "Autenticación Maestra: OK"]);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar logs de intrusión
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            if (prev.find(t => t.id === data.id)) return prev;
            return [data, ...prev].sort((a,b) => b.time - a.time).slice(0, 10);
          });
          setNetLog(prev => [`Recibido: ${data.type}`, ...prev].slice(0, 5));
        }
      });

      // Alerta sonora (toast)
      g.get('latest_threat_signal').on((data: any) => {
        if (data && data.time > Date.now() - 15000) {
          toast.error("AMENAZA EN TIEMPO REAL", { description: data.type });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="p-8 rounded-[3rem] bg-red-900/10 border border-red-600/20 backdrop-blur-xl">
          <div className="flex items-center gap-6 mb-8">
            <Shield size={40} className="text-red-600" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Vigilance</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lista de Amenazas */}
            <div className="space-y-4">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Intrusion History</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-[10px]">{t.type}</span>
                            <span className="text-white font-bold text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-gray-700 text-xs italic">Escuchando red...</p>}
                </div>
            </div>

            {/* Consola de Red */}
            <div className="p-6 bg-black rounded-[2rem] border border-white/5">
                <h2 className="text-[10px] font-black text-gray-600 uppercase mb-4 flex items-center gap-2"><Terminal size={12}/> Live Network Traffic</h2>
                <div className="space-y-1">
                    {netLog.map((log, i) => (
                        <p key={i} className="text-[10px] text-green-500/70">{">"} {log}</p>
                    ))}
                    <p className="text-[10px] text-green-400 animate-pulse">{">"} Escuchando paquetes P2P...</p>
                </div>
            </div>
          </div>
        </div>

        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-purple-500 hover:text-white transition-all">Salir del Modo Admin</button>
      </div>
    </main>
  )
}
