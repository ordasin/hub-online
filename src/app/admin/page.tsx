'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, AlertTriangle, Home, RefreshCw, Trash2, ShieldCheck } from 'lucide-react'
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

      // ESCUCHA ACTIVA DE LA CORRIENTE DE AMENAZAS
      g.get('threat_stream').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            // Evitar duplicados por ID de GunDB
            if (prev.find(t => t._id === id)) return prev;
            
            const newThreat = { ...data, _id: id };
            
            // Disparar notificación solo para ataques muy recientes (últimos 10s)
            if (data.time > Date.now() - 10000) {
              toast.error("¡NUEVA INTRUSIÓN DETECTADA!", {
                description: `${data.type} detectado ahora mismo`,
                duration: 5000
              });
            }

            return [newThreat, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });
    };
    init();
  }, [])

  const resetStream = () => {
    if (gun) {
      // En GunDB para "borrar" una lista se suele cambiar el nodo padre
      gun.get('threat_stream').put(null);
      setThreats([]);
      toast.info("Historial de red reiniciado");
      setTimeout(() => window.location.reload(), 500);
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 rounded-[3rem] bg-red-900/10 border-2 border-red-600/20 backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40"><Shield size={32} /></div>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">RED DE VIGILANCIA</h1>
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest mt-1">
                        <ShieldCheck size={12}/> Nodo Maestro Sincronizado
                    </div>
                </div>
            </div>
            <button onClick={resetStream} className="p-4 bg-white/5 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl transition-all border border-white/5">
                <Trash2 size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em] mb-6">Threat Stream Analysis</h2>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {threats.map((t) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={t._id} 
                    className="p-5 bg-black/40 border border-white/5 rounded-[1.5rem] flex justify-between items-center group hover:border-red-500/30 transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" />
                      <div>
                        <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">{t.type}</p>
                        <p className="text-gray-500 text-[9px] mt-1 font-bold truncate max-w-md uppercase">{t.userAgent}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</p>
                      <p className="text-red-900 font-black text-[8px] uppercase mt-1">Status: Logged</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {threats.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Esperando tráfico malicioso...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all">Regresar al Panel Principal</button>
      </div>
    </main>
  )
}
