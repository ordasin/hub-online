'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, WifiOff, Terminal, RefreshCw, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["INICIANDO..."])

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      try {
        // @ts-ignore
        if (!window.Gun) {
          setDiag(prev => ["ERROR: LIBRERÍA NO DETECTADA", ...prev]);
          return;
        }

        // @ts-ignore
        gun = window.Gun({ peers: PEERS, localStorage: true });
        
        gun.on('hi', () => setPeers(p => p + 1));
        gun.on('bye', () => setPeers(p => Math.max(0, p - 1)));

        // @ts-ignore
        const user = gun.user().recall({ sessionStorage: true });
        
        const checkAuth = () => {
          if (user.is) {
            if (user.is.pub === MASTER_PUB || user.is.alias === 'ordasin') {
              setIsAdmin(true);
              setDiag(prev => ["ACCESO CONCEDIDO", ...prev]);
            } else {
              setIsAdmin(false);
            }
          }
        };

        checkAuth();
        gun.on('auth', checkAuth);

        // Si en 5 segundos no hemos verificado, forzamos comprobación de sesión local
        setTimeout(() => {
          if (isAdmin === null && !user.is) setIsAdmin(false);
        }, 5000);

        // ESCUCHA DE AMENAZAS (Canal V8)
        gun.get('HUB_SEC_V8').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => {
              if (prev.find(t => t.id === id)) return prev;
              toast.error("AMENAZA DETECTADA");
              return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
            });
          }
        });

      } catch (e: any) {
        setDiag(prev => ["FALLO CRÍTICO: " + e.message, ...prev]);
      }
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) { init(); clearInterval(loader); }
    }, 1000);
    return () => clearInterval(loader);
  }, []);

  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-black text-purple-500 flex items-center justify-center font-mono">
        <div className="text-center space-y-6">
          <RefreshCw className="mx-auto animate-spin" size={32} />
          <p className="text-[10px] tracking-[0.3em] uppercase">Sincronizando con la malla...</p>
          <div className="text-[8px] text-gray-700 space-y-1">
            {diag.map((d, i) => <p key={i}>{d}</p>)}
          </div>
        </div>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-10 font-mono text-center">
        <div className="space-y-6">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h1 className="text-xl font-black uppercase italic">Identidad no autorizada</h1>
          <button onClick={() => window.location.href='/login'} className="px-8 py-3 bg-white text-black font-black rounded-xl text-xs">REINTENTAR LOGIN</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest italic">Hub Watcher</h1>
          </div>
          <div className={`px-4 py-2 rounded-full border text-[10px] font-black flex items-center gap-2 ${peers > 0 ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}`}>
            <Wifi size={14} className={peers > 0 ? "animate-bounce" : ""} />
            <span>NODOS: {peers}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-bold text-[10px] uppercase">Alerta de Seguridad</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest">Monitorizando red...</p>}
        </div>
      </div>
    </main>
  )
}