'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, ShieldAlert, Wifi, Globe, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const GLOBAL_PEERS = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ 
        peers: GLOBAL_PEERS,
        webRTC: false // Sincronización universal por WebSockets
      });
      setGun(g);

      g.on('hi', () => setPeers(p => p + 1));
      
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // ESCUCHA UNIVERSAL
      g.get('GLOBAL_SECURITY_V2').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === data.id)) return prev;
            return [data, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
          });
        }
      });

      g.get('LATEST_GLOBAL_ALERT').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error("! INTRUSIÓN EXTERNA !", { 
            description: `Ataque ${data.type} detectado desde otro nodo`,
            duration: 10000
          });
        }
      });
    };

    const interval = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-8 bg-red-950/5 border border-red-600/20 rounded-3xl flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <ShieldAlert size={40} className="text-red-600 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-widest italic">Global Watcher</h1>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>Nodos de Red: {peers}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2"><Globe size={14}/> Cross-Browser Threat Feed</h2>
            <button onClick={() => gun.get('GLOBAL_SECURITY_V2').put(null)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="px-3 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase">{t.type}</div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-300">{t.details}</p>
                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest">{t.browser} - P2P_SIGNAL</p>
                  </div>
                </div>
                <span className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escaneando malla global...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
