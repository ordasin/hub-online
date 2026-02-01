'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun', 'https://gunjs.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [status, setStatus] = useState('Iniciando sistema...')

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) {
        setStatus('Error: Librería P2P no encontrada');
        return;
      }

      const g = Gun({ peers: PEERS });
      
      g.on('hi', () => {
        setPeers(p => p + 1);
        setStatus('Red P2P Activa');
      });

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      g.get('CORE_SECURITY_FINAL').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    // Esperar a que las librerías del CDN carguen
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
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-500 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase italic">Vigilante Central</h1>
          </div>
          <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase flex items-center gap-2">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>{status} (Peers: {peers})</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-2"><Activity size={12}/> Live Security Feed</h2>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                <span className="text-red-500 font-black text-[10px] uppercase">Amenaza Detectada</span>
                <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Escaneando paquetes...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}