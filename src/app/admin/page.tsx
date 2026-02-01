'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw, Send, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["CENTRO DE MANDO V2"])
  const [gun, setGun] = useState<any>(null)

  const startP2P = () => {
    try {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({
        peers: PEERS,
        localStorage: true,
        retry: 500
      });
      setGun(g);

      g.on('hi', (p: any) => {
        setPeers(prev => prev + 1);
        setDiag(prev => [`NODO ACTIVO: ${p.url || 'Relé Global'}`, ...prev]);
      });

      g.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // Escucha de alertas en el canal principal
      g.get('VIGILANCE_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("!!! AMENAZA EN TIEMPO REAL !!!", { description: data.details });
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });
    } catch (e: any) {
      setDiag(prev => ["ERROR: " + e.message, ...prev]);
    }
  }

  useEffect(() => {
    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        startP2P();
        clearInterval(check);
      }
    }, 1000);
    return () => clearInterval(check);
  }, [])

  useEffect(() => {
    if (gun) {
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
    }
  }, [gun])

  if (!isAdmin) {
    return (
        <main className="min-h-screen bg-black text-red-500 p-10 font-mono">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-xl font-black uppercase flex items-center gap-4 animate-pulse"><Shield/> Acceso Restringido</h1>
                <div className="border border-red-900/30 p-8 bg-red-900/5 rounded-3xl space-y-2 h-64 overflow-y-auto scrollbar-hide">
                    {diag.map((d, i) => <p key={i} className="text-[10px]">{">"} {d}</p>)}
                </div>
                <div className="flex justify-between items-center pt-6">
                    <div className="flex items-center gap-2">
                        <Wifi size={14} className={peers > 0 ? 'text-green-500' : 'text-red-500'}/>
                        <span className="text-[10px] uppercase font-black tracking-widest">Señal: {peers > 0 ? 'Estable' : 'Buscando...'}</span>
                    </div>
                    <button onClick={() => window.location.href='/login'} className="px-6 py-2 bg-white text-black font-black rounded-xl text-[10px] uppercase">Login</button>
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="p-8 border-2 border-red-600/20 bg-red-950/5 rounded-[2.5rem] flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Command Unit</h1>
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
            <RefreshCw size={14}/> REINICIAR MALLA
          </button>
        </div>

        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-2 tracking-[0.4em]"><Activity size={14}/> Live Security Stream</h2>
            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence initial={false}>
                    {threats.map(t => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-5 bg-red-900/10 border border-red-900/20 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <AlertTriangle className="text-red-500" size={20} />
                                <div>
                                    <p className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza Detectada</p>
                                    <p className="text-gray-500 text-[10px] font-bold mt-1">Detalle: {t.details}</p>
                                </div>
                            </div>
                            <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escaneando red mundial...</p>}
            </div>
        </div>
      </div>
    </main>
  )
}
