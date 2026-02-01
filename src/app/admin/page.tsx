'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, RefreshCw, Server, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

// Lista de relés redundantes de alta disponibilidad
const PEER_LIST = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.gun.eco/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [peers, setPeers] = useState(0)
  const [threats, setThreats] = useState<any[]>([])
  const [statusLog, setStatusLog] = useState<string[]>(["SISTEMA INICIADO"])

  useEffect(() => {
    let gun: any = null;
    let checkInterval: any;

    const init = () => {
      // @ts-ignore
      if (!window.Gun) return;

      setStatusLog(prev => ["ESTABLECIENDO MALLA DE SEGURIDAD...", ...prev]);

      // @ts-ignore
      gun = window.Gun({
        peers: PEER_LIST,
        localStorage: true,
        retry: 1000,
        // Forzamos WebSockets para evitar el bloqueo de WebRTC en redes corporativas/incógnito
        webRTC: false 
      });

      // Monitor de conexión agresivo
      checkInterval = setInterval(() => {
        try {
          const mesh = gun.back('opt.peers');
          const connected = Object.keys(mesh).filter(k => mesh[k].wire && mesh[k].wire.readyState === 1).length;
          setPeers(connected);
          
          if (connected > 0) {
            setStatusLog(prev => [`RED ACTIVA: ${connected} NODOS`, ...prev.slice(0, 5)]);
          }
        } catch(e) {}
      }, 2000);

      // Verificación de Admin
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
      } else if (user.is && user.is.alias === 'ordasin') {
        setIsAdmin(true); // Bypass por nombre
      }

      // Escuchar Alertas
      gun.get('VIGILANCE_V1').map().on((data: any, id: string) => {
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
    }, 500);

    return () => {
      clearInterval(loader);
      clearInterval(checkInterval);
    };
  }, []);

  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black">ACCESO DENEGADO</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* NETWORK PULSE BAR */}
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-[2.5rem] flex justify-between items-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <Shield className="text-red-600 animate-pulse" size={40} />
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Security Node</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.3em]">MODO VIGILANCIA ACTIVO</p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`px-6 py-2 rounded-full border-2 flex items-center gap-3 transition-all ${peers > 0 ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                <Wifi size={16} className={peers > 0 ? "animate-bounce" : ""} />
                <span className="text-xs font-black uppercase tracking-widest">Nodos en Malla: {peers}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Intrusiones Detectadas</h2>
                <div className="grid grid-cols-1 gap-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <Zap className="text-red-500" size={16} />
                                <span className="text-red-400 font-bold text-[10px] uppercase">Alerta Recibida</span>
                            </div>
                            <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Monitorizando red...</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Consola de Red</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] h-64 overflow-y-auto space-y-1 scrollbar-hide">
                    {statusLog.map((log, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {log}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} _</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase hover:bg-purple-600 hover:text-white transition-all">Reiniciar Monitor</button>
            </div>
        </div>
      </div>
    </main>
  )
}