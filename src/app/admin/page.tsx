'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
// RELÉS NUEVOS (Para saltar posibles bloqueos de IP)
const FRESH_PEERS = [
  'https://gun-eu.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://dletta.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [status, setStatus] = useState('Iniciando...')

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      // @ts-ignore
      gun = Gun({
        peers: FRESH_PEERS,
        localStorage: true,
        retry: 2000 // Más lento para evitar baneos de IP
      });

      gun.on('hi', () => {
        setPeers(p => p + 1);
        setStatus('Sincronizado');
      });

      gun.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && (user.is.alias === 'ordasin' || user.is.pub === MASTER_PUB)) {
        setIsAdmin(true);
      } else {
        setTimeout(() => { if (!user.is) setIsAdmin(false); }, 3000);
      }

      // CANAL NUEVO Y LIMPIO: SECURITY_V10_CORE
      gun.get('SECURITY_V10_CORE').map().on((data: any, id: string) => {
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
      if (window.Gun && window.Gun.SEA) {
        init();
        clearInterval(loader);
      }
    }, 1000);
    return () => clearInterval(loader);
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white animate-pulse uppercase text-xs">Autenticando Nodo Maestro...</div>;
  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black uppercase tracking-widest">Acceso Denegado</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest italic">Vigilancia Core</h1>
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2 text-green-400">
            <Wifi size={14} className={peers > 0 ? "animate-bounce" : "text-red-500"}/>
            <span>SEÑAL: {peers > 0 ? 'ACTIVA' : 'RECONECTANDO...'} ({peers})</span>
          </div>
        </div>

        <div className="space-y-4">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-bold text-[10px] uppercase">Alerta Detectada</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Escaneando red mundial...</p>}
        </div>
      </div>
    </main>
  )
}
