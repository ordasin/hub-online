'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Activity, Users, Ban, XCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun'],
        localStorage: false // Evitar conflictos de caché local en el admin
      });
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("Consola Maestra Conectada");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar todas las amenazas
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== data.id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 10);
          });
        }
      });

      // Notificación inmediata para la última amenaza
      g.get('latest_threat').on((data: any) => {
        if (data && data.time > Date.now() - 5000) { // Solo si es reciente
          toast.error(`ATAQUE DETECTADO: ${data.type}`, {
            description: data.path,
            icon: <AlertTriangle />
          });
        }
      });

      // Contador de usuarios simplificado
      g.get('online_users').map().on((time: number) => {
        if (Date.now() - time < 20000) {
            // Recalcular online count basado en los nodos que han hecho ping recientemente
            // (En P2P real esto es aproximado)
        }
      });
    };

    if (typeof window !== 'undefined') initAdmin();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 backdrop-blur-xl flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Shield size={48} className="text-red-500 animate-pulse" />
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">ORDASIN COMMAND</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Master Node: Authorized</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2">
                    <Activity size={20} className="text-red-400" /> Monitor de Amenazas en Vivo
                </h2>
                <div className="space-y-4">
                    {threats.length === 0 && <p className="text-gray-600 italic text-sm text-center py-10">Esperando actividad sospechosa...</p>}
                    <AnimatePresence>
                        {threats.map((t) => (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-red-400 font-black text-xs uppercase">[{t.type}]</p>
                                    <p className="text-gray-500 text-[9px] font-mono mt-1 max-w-xs truncate">{t.userAgent}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-[10px]">{new Date(t.time).toLocaleTimeString()}</p>
                                    <p className="text-gray-600 text-[10px]">{t.path}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <h3 className="font-black text-xs uppercase tracking-widest mb-6">Herramientas de Red</h3>
                <button onClick={() => gun.get('intrusion_logs').put(null)} className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase transition-all mb-4">Purgar Historial</button>
                <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-purple-500 hover:text-white transition-all">Panel Principal</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
