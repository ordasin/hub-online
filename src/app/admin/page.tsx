'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [status, setStatus] = useState('Iniciando...')

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ peers: PEERS });
      
      g.on('hi', () => {
        setPeers(p => p + 1);
        setStatus('Red P2P Online');
      });

      // Verificación de Admin
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escucha agresiva del canal de seguridad
      g.get('ORDASIN_SEC_V6').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("¡NUEVA AMENAZA!", { description: data.type });
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(check);
      }
    }, 1000);
    return () => clearInterval(check);
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/30 bg-red-950/10 rounded-[2.5rem] flex justify-between items-center shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-red-600 animate-pulse" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Command Center V6</h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-bounce" : "text-red-500"}/>
            <span>{status} ({peers})</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-2"><Activity size={14}/> Intrusion Stream</h2>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-xs font-black uppercase text-red-400">{t.type}</p>
                </div>
                <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Escaneando red en busca de ataques...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}