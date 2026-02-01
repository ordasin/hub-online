'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      
      const g = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
        webRTC: false // Sincronización por WebSockets pura
      });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // Escuchar señales rápidas
      g.get('latest_threat_signal').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error("!!! ATAQUE DETECTADO !!!", { description: data.type });
        }
      });

      // Escuchar stream de historial
      g.get('threat_stream').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t._id === id)) return prev;
            return [{ ...data, _id: id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 rounded-[3rem] bg-red-900/10 border-2 border-red-600/20 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
                <Shield size={48} className="text-red-600" />
                <h1 className="text-4xl font-black uppercase tracking-tighter">Command Center</h1>
            </div>
            <button onClick={() => gun.get('threat_stream').put(null)} className="p-4 bg-white/5 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={24}/></button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase flex items-center gap-2"><Activity size={18} /> Threat Stream</h2>
            <div className="space-y-2">
              <AnimatePresence>
                {threats.map((t) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t._id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <AlertTriangle size={16} className="text-red-500" />
                      <p className="text-red-500 font-black text-xs uppercase">{t.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</p>
                      <p className="text-red-900 text-[8px] font-bold uppercase">{t.path}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}