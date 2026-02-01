'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Trash2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      if (!window.Gun) return;
      // @ts-ignore
      const g = window.Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun'],
        localStorage: true
      });
      setGun(g);

      g.on('hi', () => setPeers(p => p + 1));
      g.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // ESCUCHA DEL CANAL DEFINITIVO
      g.get('ORDASIN_FINAL_SHIELD').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("! AMENAZA DETECTADA !", { description: data.type });
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
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
    return () => clearInterval(checker);
  }, [])

  const testSignal = () => {
    if (gun) {
      const id = 'test-' + Date.now();
      gun.get('ORDASIN_FINAL_SHIELD').get(id).put({ id, type: 'TEST_PULSE', time: Date.now() });
      toast.info("Enviando señal de prueba...");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase italic">Master Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={testSignal} className="px-6 py-2 bg-blue-600 rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-blue-500 transition-all"><Send size={12}/> TEST</button>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2 text-green-400">
                <Wifi size={14} className={peers > 0 ? "animate-bounce" : "text-red-500"}/>
                <span>NODOS: {peers}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center group hover:bg-red-900/20 transition-all">
                    <span className="text-red-500 font-black text-xs uppercase tracking-tighter">Intrusión Detectada</span>
                    <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Escaneando red mundial...</p>}
        </div>
      </div>
    </main>
  )
}