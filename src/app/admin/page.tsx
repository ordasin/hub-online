'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw, Send, Network } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

// Nueva lista de relés con protocolo explícito WSS
const PEER_LIST = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["SISTEMA DE VIGILANCIA V5"])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    let gunInstance: any = null;

    const connectP2P = () => {
      try {
        // @ts-ignore
        if (!window.Gun) return;

        setDiag(prev => ["INTENTANDO CONEXIÓN GLOBAL...", ...prev]);
        
        // @ts-ignore
        gunInstance = window.Gun({ 
          peers: PEER_LIST,
          localStorage: true,
          retry: 1000 // Reintentar cada segundo
        });
        setGun(gunInstance);

        gunInstance.on('hi', (peer: any) => {
          setPeers(p => p + 1);
          setDiag(prev => [`NODO DETECTADO: ${peer.url || 'Anónimo'}`, ...prev]);
          toast.success("NODO CONECTADO");
        });

        gunInstance.on('bye', () => {
          setPeers(p => Math.max(0, p - 1));
          setDiag(prev => ["NODO DESCONECTADO", ...prev]);
        });

        // Verificación de identidad
        // @ts-ignore
        const user = gunInstance.user().recall({ sessionStorage: true });
        if (user.is && user.is.pub === MASTER_PUB) {
            setIsAdmin(true);
            setDiag(prev => ["ACCESO AUTORIZADO", ...prev]);
        }

        // Escucha de logs
        gunInstance.get('VIGILANCE_V1').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => {
              if (prev.find(t => t.id === id)) return prev;
              if (data.time > Date.now() - 30000) toast.error("ATAQUE DETECTADO");
              return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
            });
          }
        });

      } catch (err: any) {
        setDiag(prev => ["ERROR DE RED: " + err.message, ...prev]);
      }
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        connectP2P();
        clearInterval(loader);
      }
    }, 1000);

    return () => {
        clearInterval(loader);
        if (gunInstance) gunInstance.off();
    };
  }, [])

  if (!isAdmin) {
    return (
        <main className="min-h-screen bg-black text-red-500 p-10 font-mono">
            <div className="max-w-4xl mx-auto space-y-6 border border-red-900/30 p-10 bg-red-900/5 rounded-3xl shadow-2xl">
                <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-4 animate-pulse">
                    <Network size={24}/> Network Diagnostic
                </h1>
                <div className="space-y-2 h-64 overflow-y-auto pr-4 scrollbar-hide">
                    {diag.map((d, i) => <p key={i} className="text-xs">{">"} {d}</p>)}
                </div>
                <div className="pt-6 border-t border-red-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Wifi size={14} className={peers > 0 ? "text-green-500" : "text-red-500"}/>
                        <span className="text-[10px] uppercase font-black tracking-widest">Nodos en Malla: {peers}</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-red-500 transition-all">Reconectar</button>
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest">Master Commander</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
                <span>NODOS: {peers}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {threats.map(t => (
                <div key={t.id} className="p-5 bg-red-900/10 border border-red-900/20 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                        <p className="text-red-500 font-black text-xs uppercase tracking-widest">Inyección Detectada</p>
                    </div>
                    <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-40 text-gray-700 uppercase text-[10px] font-black tracking-widest">Escaneando red mundial...</p>}
        </div>
      </div>
    </main>
  )
}
