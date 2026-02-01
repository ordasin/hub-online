'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Users, AlertTriangle, Trash2, Home, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

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

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("CONSOLA ACTIVADA");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar logs
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== data.id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 10);
          });
        }
      });

      // Notificación inmediata
      g.get('latest_threat').on((data: any) => {
        if (data && data.time > Date.now() - 5000) {
          toast.error(`!!! AMENAZA: ${data.type} !!!`, { duration: 5000 });
        }
      });
    };
    init();
  }, [])

  const simulateThreat = () => {
    if (gun) {
      const testId = Math.random().toString(36).substring(7);
      const log = { id: testId, type: 'TEST_ALERT', path: '/test', time: Date.now(), userAgent: 'Master Node Test' };
      gun.get('intrusion_logs').get(testId).put(log);
      gun.get('latest_threat').put(log);
      toast.info("Prueba de alerta enviada a la red P2P");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="p-8 rounded-[2.5rem] bg-red-900/10 border-2 border-red-600/20 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-red-500" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Command Hub</h1>
          </div>
          <button onClick={simulateThreat} className="px-6 py-2 bg-white text-black text-[10px] font-black rounded-full hover:bg-red-500 hover:text-white transition-all">
            SIMULAR ATAQUE
          </button>
        </div>

        {/* Threats List */}
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 text-red-400">
            <Activity size={20} /> Historial de Intrusiones
          </h2>
          <div className="space-y-3">
            {threats.length === 0 && <p className="text-gray-600 italic py-10 text-center uppercase text-xs tracking-widest">Escaneando red en busca de amenazas...</p>}
            <AnimatePresence>
              {threats.map((t) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} className="p-4 bg-red-900/5 border border-red-900/20 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full mr-3 uppercase">{t.type}</span>
                    <span className="text-gray-400 text-[10px] font-bold">{t.userAgent.substring(0, 50)}...</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</p>
                    <p className="text-red-500 text-[9px] font-bold uppercase">{t.path}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Admin */}
        <div className="flex gap-4">
            <button onClick={() => gun.get('intrusion_logs').put(null)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600/20 hover:text-red-400 transition-all">Purgar Logs</button>
            <button onClick={() => window.location.href = '/'} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2"><Home size={14}/> Volver</button>
        </div>
      </div>
    </main>
  )
}