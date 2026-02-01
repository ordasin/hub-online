'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
// Relé oficial de GunJS (máxima estabilidad)
const PEER = 'https://gunjs.herokuapp.com/gun';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["SISTEMA INICIADO"])

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) {
        setDiag(prev => [...prev, "ERROR: Librería no cargada"]);
        return;
      }

      setDiag(prev => [...prev, "Conectando a relé oficial..."]);
      
      gun = Gun({ 
        peers: [PEER],
        localStorage: false,
        webRTC: false // Forzamos WebSockets puros
      });

      // Capturar eventos de conexión
      gun.on('hi', (peer: any) => {
        setPeers(p => p + 1);
        setDiag(prev => [...prev, "¡CONECTADO! Nodo: " + PEER]);
        toast.success("RED P2P SINCRONIZADA");
      });

      gun.on('bye', () => {
        setPeers(p => Math.max(0, p - 1));
        setDiag(prev => [...prev, "Conexión perdida"]);
      });

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);

      // Escucha de amenazas
      gun.get('HUB_SECURITY_V10').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
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
    }, 1000);

    return () => clearInterval(loader);
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="p-8 border border-white/10 bg-black rounded-[2.5rem] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="text-purple-500 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase italic tracking-widest">Master Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-bounce" : "text-red-500"}/>
            <span>Red: {peers > 0 ? 'ONLINE' : 'BUSCANDO...'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Monitor de Amenazas</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-[10px] uppercase">Ataque Detectado</span>
                            <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black">Escaneando red mundial...</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Consola de Red</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] h-64 overflow-y-auto space-y-1">
                    {diag.map((d, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {d}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} _</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={14}/> Reiniciar Sistema
                </button>
            </div>
        </div>
      </div>
    </main>
  )
}