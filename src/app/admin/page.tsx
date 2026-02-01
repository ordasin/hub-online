'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("CENTRO DE MANDO ACTIVO");
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      // Escuchar el núcleo de seguridad
      g.get('ORDASIN_SEC_CORE').map().on((data: any, id: string) => {
        if (data && data.time) {
          setLogs(prev => {
            if (prev.find(l => l.id === data.id)) return prev;
            
            if (data.time > Date.now() - 30000) {
              toast.error("AMENAZA DETECTADA", { description: data.details });
            }
            
            return [{ ...data, id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
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
        <div className="p-8 border-2 border-red-600/20 bg-red-900/5 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-red-600 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tighter">SEC-CORE MONITOR</h1>
          </div>
          <button onClick={() => gun.get('ORDASIN_SEC_CORE').put(null)} className="px-4 py-2 bg-red-600 rounded text-[10px] font-black hover:bg-red-500">LIMPIAR NODO</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {logs.map((l) => (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={l.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-[10px] font-bold text-gray-400">{l.details}</span>
                </div>
                <span className="text-white text-[10px] font-black">{new Date(l.time).toLocaleTimeString()}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length === 0 && <p className="text-center py-20 text-gray-700 text-xs">SILENCIO EN LA RED...</p>}
        </div>
      </div>
    </main>
  )
}