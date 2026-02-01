'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Trash2, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

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
        peers: ['https://gun-manhattan.herokuapp.com/gun'],
        localStorage: true 
      });
      setGun(g);

      g.on('hi', () => setPeers(prev => prev + 1));
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('CORE_SECURITY_V4').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t._id === id)) return prev;
            if (data.time > Date.now() - 30000) {
              toast.error("AMENAZA DETECTADA", { description: data.details });
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
        
        <div className="p-8 border border-red-600/20 bg-red-900/5 rounded-[2.5rem] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-red-600" />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Vigilance Center</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black">
            <Wifi size={12} className={peers > 0 ? "text-blue-400" : "text-red-500"}/>
            <span>Red P2P: {peers > 0 ? 'CONECTADA' : 'CONECTANDO...'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2"><Activity size={12}/> Live Security Stream</h2>
          <div className="grid grid-cols-1 gap-2">
            {threats.map((t) => (
              <div key={t._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-[10px] font-bold text-gray-400">{t.details}</p>
                </div>
                <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
              </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Monitorizando red...</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
