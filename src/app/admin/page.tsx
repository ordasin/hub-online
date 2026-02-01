'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Trash2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = [
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      
      const g = Gun({ 
        peers: PEERS,
        localStorage: true 
      });
      setGun(g);

      g.on('hi', () => setPeers(prev => prev + 1));
      g.on('bye', () => setPeers(prev => Math.max(0, prev - 1)));
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('CORE_SECURITY_V5').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t._id === id)) return prev;
            if (data.time > Date.now() - 30000) {
              toast.error("AMENAZA DETECTADA", { description: data.type });
            }
            return [{ ...data, _id: id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-10 border border-white/10 bg-black rounded-[3rem] flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-6">
            <Shield size={40} className="text-purple-500 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-widest italic">Hub Watcher</h1>
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-bounce" : "text-red-500"}/>
            <span>Nodos Activos: {peers}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2"><Activity size={14}/> Threat Intelligence</h2>
            <button onClick={() => gun.get('CORE_SECURITY_V5').put(null)} className="text-red-500 text-[10px] font-black uppercase">Limpiar Red</button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                  <p className="text-xs font-bold text-red-400 uppercase tracking-tighter">{t.type}</p>
                </div>
                <span className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Monitorizando red...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}