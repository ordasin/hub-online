'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, WifiOff, Terminal, RefreshCw, Send, ShieldAlert, Package, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEER_LIST = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    let checkInterval: any;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({
        peers: PEER_LIST,
        localStorage: true,
        retry: 1000
      });
      setGun(g);

      // Monitor de conexión preciso
      checkInterval = setInterval(() => {
        try {
          const mesh = g.back('opt.peers');
          const connected = Object.keys(mesh).filter(k => mesh[k].wire && mesh[k].wire.readyState === 1).length;
          setPeers(connected);
        } catch(e) {}
      }, 2000);

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      
      const syncUser = () => {
        if (user.is) {
          if (user.is.pub === MASTER_PUB || user.is.alias === 'ordasin') {
            setIsAdmin(true);
            toast.success("CENTRO DE MANDO SINCRONIZADO");
          } else {
            setIsAdmin(false);
          }
        } else {
          setTimeout(() => { if (!user.is) setIsAdmin(false); }, 3000);
        }
      };

      syncUser();
      g.on('auth', syncUser);

      // Escucha de amenazas
      g.get('ORDASIN_V1_SEC').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) toast.error("!!! AMENAZA DETECTADA !!!");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
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
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-purple-500 uppercase text-[10px] animate-pulse">Estableciendo Enlace P2P...</div>;
  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black uppercase tracking-widest p-10 text-center">Acceso Denegado: Firma no autorizada</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER STATUS */}
        <div className="p-8 border-2 border-red-600/20 bg-red-950/5 rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest italic">Vigilancia P2P</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full border text-[10px] font-black flex items-center gap-2 ${peers > 0 ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                {peers > 0 ? <Wifi size={14} className="animate-bounce" /> : <WifiOff size={14} />}
                <span>RED: {peers > 0 ? 'ACTIVA' : 'BUSCANDO NODOS...'} ({peers})</span>
            </div>
          </div>
        </div>

        {/* LOGS */}
        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2"><Activity size={14}/> Forensic Feed</h2>
            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence initial={false}>
                    {threats.map(t => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_red]" />
                                <p className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza Detectada</p>
                            </div>
                            <span className="text-white font-black text-[10px] opacity-50">{new Date(t.time).toLocaleTimeString()}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escaneando malla global...</p>}
            </div>
        </div>
      </div>
    </main>
  )
}
