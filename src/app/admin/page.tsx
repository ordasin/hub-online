'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Trash2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
// Forzamos protocolo WSS para saltar bloqueos
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'wss://gun-manhattan.herokuapp.com/gun',
  'https://relay.gun.eco/gun',
  'wss://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    let checkInterval: any;

    const init = () => {
      // @ts-ignore
      if (!window.Gun) return;
      // @ts-ignore
      const g = window.Gun({
        peers: PEERS,
        localStorage: true,
        retry: 1000
      });
      setGun(g);

      // Monitor de conexión agresivo
      checkInterval = setInterval(() => {
        try {
          const mesh = g.back('opt.peers');
          const connected = Object.keys(mesh).filter(k => mesh[k].wire && mesh[k].wire.readyState === 1).length;
          setPeers(connected);
        } catch(e) {}
      }, 2000);

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('ORDASIN_FINAL_SHIELD').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) toast.error("! AMENAZA DETECTADA !");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
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
    return () => {
        clearInterval(checker);
        clearInterval(checkInterval);
    };
  }, [])

  const testSignal = () => {
    if (gun) {
      const id = 'test-' + Date.now();
      gun.get('ORDASIN_FINAL_SHIELD').get(id).put({ id, type: 'TEST', time: Date.now() });
      toast.info("Pulso enviado");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest italic">Vigilancia Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={testSignal} className="px-6 py-2 bg-blue-600 rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-blue-500 transition-all"><Send size={12}/> TEST</button>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500 animate-pulse"}/>
                <span>SEÑAL: {peers > 0 ? 'CONECTADO' : 'BUSCANDO...'} ({peers})</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-black text-xs uppercase tracking-tighter">Infiltración Detectada</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse tracking-widest">Escaneando Red...</p>}
        </div>
      </div>
    </main>
  )
}
