'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, RefreshCw, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: PEERS });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // Alerta sonora (toast) con margen amplio para incógnito (2 minutos)
      g.get('latest_threat_signal').on((data: any) => {
        if (data && data.time > Date.now() - 120000) {
          toast.error("¡AMENAZA DETECTADA!", { 
            description: `${data.type} en ${data.path}`,
            duration: 10000
          });
        }
      });

      // Mapear historial completo
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            if (prev.find(t => t.id === data.id)) return prev;
            return [data, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
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
            <button onClick={() => gun.get('intrusion_logs').put(null)} className="p-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={24}/></button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase flex items-center gap-2"><Activity size={18} /> Intrusion Logs</h2>
            <div className="space-y-2">
              {threats.map((t) => (
                <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <AlertTriangle size={16} className="text-red-500" />
                    <div><p className="text-red-500 font-black text-xs uppercase">{t.type}</p><p className="text-gray-500 text-[10px] truncate max-w-md">{t.userAgent}</p></div>
                  </div>
                  <div className="text-right"><p className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</p><p className="text-red-500 text-[9px] font-bold uppercase">{t.path}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-purple-500 hover:text-white transition-all">Regresar</button>
      </div>
    </main>
  )
}
