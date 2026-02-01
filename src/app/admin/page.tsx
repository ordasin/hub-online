'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, AlertTriangle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [logs, setLogs] = useState<string[]>(["Iniciando sistema..."])

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      // Usamos el relé más compatible por el puerto 443
      gun = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://relay.gun.eco/gun'],
        localStorage: true
      });

      gun.on('hi', () => {
        setPeers(prev => prev + 1);
        setLogs(prev => ["Conexión establecida con éxito", ...prev]);
      });

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);

      gun.get('CORE_SECURITY_V4').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("AMENAZA DETECTADA");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(checker);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  if (!isAdmin) {
    return (
        <main className="min-h-screen bg-black text-red-500 p-10 font-mono">
            <h1 className="text-xl font-black mb-6 uppercase tracking-widest flex items-center gap-2 animate-pulse"><Activity size={20}/> Diagnóstico de Seguridad</h1>
            <div className="border border-red-900/30 p-8 bg-red-900/5 rounded-3xl space-y-4">
                <div className="h-48 overflow-y-auto space-y-1">
                    {logs.map((l, i) => <p key={i} className="text-xs">{">"} {l}</p>)}
                </div>
                <div className="pt-6 border-t border-red-900/20 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase">Nodos: {peers}</span>
                    <button onClick={() => window.location.href='/login'} className="bg-white text-black px-4 py-2 rounded text-[10px] font-black uppercase">Ir al Login</button>
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase">Master Monitor</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>Red: {peers > 0 ? 'Conectada' : 'Buscando...'} ({peers})</span>
          </div>
        </div>

        <div className="space-y-4">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-black text-xs uppercase">Intrusión</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-[10px] font-black uppercase tracking-widest">Escaneando...</p>}
        </div>
      </div>
    </main>
  )
}