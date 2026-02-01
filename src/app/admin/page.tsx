'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
// MALLA DE RELÉS GLOBALES (Redundancia Máxima)
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://relay.gun.eco/gun',
  'https://peer.wall.org/gun',
  'https://gunjs.herokuapp.com/gun'
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
        const g = window.Gun({ peers: PEERS, localStorage: true });
        setGun(g);

        g.on('hi', (p: any) => {
          setPeers(prev => prev + 1);
          setDiag(prev => [`CONECTADO A RELÉ [${prev.length}]`, ...prev]);
        });

        g.on('bye', () => setPeers(p => Math.max(0, p - 1)));

        // @ts-ignore
        const user = g.user().recall({ sessionStorage: true });
        if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);

        g.get('VIGILANCE_V1').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => {
              if (prev.find(t => t.id === id)) return prev;
              if (data.time > Date.now() - 30000) toast.error("!!! AMENAZA DETECTADA !!!");
              return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
            });
          }
        });
      } catch (err: any) {
        setDiag(prev => ["ERROR: " + err.message, ...prev]);
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
      toast.info("Emitiendo pulso de test...");
    }
  }

  if (!isAdmin) {
    return (
        <main className="min-h-screen bg-black text-red-500 p-20 font-mono">
            <h1 className="text-xl font-black mb-10 uppercase flex items-center gap-4 animate-pulse"><Terminal/> Consola de Seguridad</h1>
            <div className="space-y-2 border border-red-900/30 p-10 bg-red-900/5 rounded-3xl">
                {diag.slice(0, 10).map((d, i) => <p key={i} className="text-xs">{">"} {d}</p>)}
                <div className="mt-10 flex items-center gap-2">
                    <Wifi size={14} className={peers > 0 ? "text-green-500" : "text-red-500"}/>
                    <span className="text-[10px] uppercase font-black">Nodos en red: {peers}</span>
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Command Unit</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={testRed} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">PULSO DE TEST</button>
            <div className="px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
                <span>NODOS: {peers}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
            <AnimatePresence initial={false}>
                {threats.map(t => (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-5 bg-red-900/10 border border-red-900/20 rounded-2xl flex justify-between items-center group hover:bg-red-900/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                            <p className="text-red-500 font-black text-xs uppercase tracking-widest">Ataque Interceptado</p>
                        </div>
                        <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest">Escaneando red mundial...</p>}
        </div>
      </div>
    </main>
  )
}
