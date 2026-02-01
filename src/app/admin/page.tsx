'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, Package, Plus, Trash2, Wifi, Megaphone, Send, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const GLOBAL_PEERS = ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun', 'https://relay.gun.eco/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: GLOBAL_PEERS });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // Historial detallado
      g.get('SECURITY_ALERTS').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });

      // Notificación instantánea con detalles del Payload
      g.get('LATEST_ALERT').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error(`!!! AMENAZA: ${data.type} !!!`, { 
            description: `Payload: ${data.details.substring(0, 50)}...`,
            duration: 10000,
            icon: <ShieldAlert className="text-red-500" />
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-950/20 via-black to-red-900/10 border border-red-500/30 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)]"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic">Threat Intelligence Center</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.3em] flex items-center gap-2 animate-pulse">
                    <Wifi size={12}/> ESCANEANDO RED GLOBAL P2P
                </p>
            </div>
          </div>
          <button onClick={() => gun.get('SECURITY_ALERTS').put(null)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase">Limpiar Logs</button>
        </div>

        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 px-4">Detected Payloads & Activity</h2>
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence initial={false}>
                    {threats.map(t => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                            <div className="flex gap-6 items-center">
                                <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase ${
                                    t.type === 'SQLi' ? 'bg-red-600 text-white' : 
                                    t.type === 'RCE/Cmd' ? 'bg-purple-600 text-white' : 
                                    'bg-orange-600 text-white'
                                }`}>
                                    {t.type}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-300 text-xs font-bold font-mono">Payload: <span className="text-red-400">{t.details}</span></p>
                                    <p className="text-gray-600 text-[9px] font-medium uppercase tracking-tight truncate max-w-lg">{t.ua}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</p>
                                <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase">Logged via P2P</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {threats.length === 0 && <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-gray-700 text-xs font-black uppercase tracking-widest animate-pulse">Esperando actividad sospechosa...</div>}
            </div>
        </div>
      </div>
    </main>
  )
}
