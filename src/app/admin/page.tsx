'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [diag, setDiag] = useState<string[]>([])
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const init = async () => {
      try {
        const Gun = (await import('gun')).default;
        await import('gun/sea');
        
        const g = Gun({ peers: PEERS });
        
        g.on('hi', () => { 
            setPeers(p => p + 1);
            setDiag(prev => [...prev, "Conexión establecida con un nodo"]);
        });

        g.on('bye', () => setPeers(p => Math.max(0, p - 1)));

        const user = (g as any).user().recall({ sessionStorage: true });
        if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
        else if (typeof window !== 'undefined') window.location.href = '/login';

        g.get('CORE_SECURITY_V5').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => [data, ...prev.filter(t => t.id !== id)].slice(0, 10));
          }
        });
      } catch (err: any) {
        setDiag(prev => [...prev, "ERROR: " + err.message]);
      }
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="text-blue-500" size={32} />
            <h1 className="text-xl font-black uppercase">Monitor de Diagnóstico</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase border border-white/10">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-pulse" : "text-red-500"}/>
            <span>Nodos Activos: {peers}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase">Alertas Recibidas</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-xs uppercase">{t.type}</span>
                            <span className="text-white text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase">Consola de Red</h2>
                <div className="p-6 bg-black border border-white/10 rounded-2xl h-64 overflow-y-auto space-y-1">
                    {diag.map((d, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {d}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} Escuchando paquetes...</p>
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}
