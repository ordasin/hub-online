'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["SISTEMA: INICIANDO"])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      try {
        // @ts-ignore
        if (!window.Gun) {
            setDiag(prev => ["ERROR: GUN.JS NO CARGADO", ...prev]);
            return;
        }
        setDiag(prev => ["LIBRERÍA GUN DETECTADA", ...prev]);

        // @ts-ignore
        const g = window.Gun({ peers: PEERS, localStorage: true });
        setGun(g);

        g.on('hi', (p: any) => {
          setPeers(prev => prev + 1);
          setDiag(prev => ["CONECTADO A RELÉ", ...prev]);
        });

        // @ts-ignore
        if (!g.user) {
            setDiag(prev => ["ERROR: SEA.JS NO CARGADO", ...prev]);
            return;
        }
        setDiag(prev => ["MÓDULO DE SEGURIDAD SEA OK", ...prev]);

        // @ts-ignore
        const user = g.user().recall({ sessionStorage: true });
        if (user.is && user.is.pub === MASTER_PUB) {
            setIsAdmin(true);
            setDiag(prev => ["ACCESO MASTER AUTORIZADO", ...prev]);
        }

        g.get('VIGILANCE_V1').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => {
              if (prev.find(t => t.id === id)) return prev;
              if (data.time > Date.now() - 30000) toast.error("ATAQUE DETECTADO");
              return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
            });
          }
        });
      } catch (err: any) {
        setDiag(prev => ["ERROR CRÍTICO: " + err.message, ...prev]);
      }
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

  const testRed = () => {
    if (gun) {
      const id = 'test-' + Date.now();
      gun.get('VIGILANCE_V1').get(id).put({ id, type: 'TEST', time: Date.now() });
      toast.info("Pulso enviado");
    }
  }

  if (!isAdmin) {
    return (
        <main className="min-h-screen bg-black text-red-500 p-20 font-mono">
            <h1 className="text-xl font-black mb-10 uppercase tracking-widest flex items-center gap-4 animate-pulse"><Terminal/> Consola de Diagnóstico</h1>
            <div className="space-y-2 border border-red-900/30 p-10 bg-red-900/5 rounded-3xl">
                {diag.map((d, i) => <p key={i} className="text-xs">{">"} {d}</p>)}
                <p className="text-[10px] text-gray-600 mt-10 uppercase">Si eres el administrador, inicia sesión para desbloquear el panel.</p>
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
            <h1 className="text-2xl font-black uppercase tracking-widest">Master Watch</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={testRed} className="px-6 py-2 bg-blue-600 rounded-full text-[10px] font-black hover:bg-blue-500 transition-all">TEST</button>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
                <span>NODOS: {peers}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza_Detectada</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escuchando red P2P...</p>}
        </div>
      </div>
    </main>
  )
}