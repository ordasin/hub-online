'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Activity, Users, Ban, XCircle, AlertTriangle, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: PEERS });
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("NODO MAESTRO ONLINE", {
            description: "Conectado a la red de vigilancia P2P"
        });
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar amenazas en tiempo real
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== data.id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 15);
          });
        }
      });

      // Alerta sonora y visual para la última amenaza
      g.get('latest_threat').on((data: any) => {
        if (data && data.time > Date.now() - 10000) {
          toast.error(`!!! AMENAZA DETECTADA !!!`, {
            description: `${data.type} en ${data.path}`,
            duration: 8000
          });
        }
      });

      // Cargar proyectos
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });
    };

    if (typeof window !== 'undefined') initAdmin();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Cabecera Cyberpunk */}
            <div className="p-10 rounded-[2rem] bg-black border-2 border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                <Shield size={50} className="text-red-600 animate-pulse" />
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-widest text-white">Security Command</h1>
                    <p className="text-xs text-red-500 font-bold">ESTADO: VIGILANDO RED P2P</p>
                </div>
              </div>
            </div>

            {/* Historial de Amenazas */}
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-blue-400">
                    <Activity size={20} /> Logs de Intrusión (Tiempo Real)
                </h2>
                <div className="space-y-3">
                    {threats.length === 0 && <p className="text-gray-600 italic">No hay actividad sospechosa detectada.</p>}
                    <AnimatePresence>
                        {threats.map((t) => (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-4 bg-red-900/10 border-l-4 border-red-600 rounded-r-xl flex justify-between items-center">
                                <div>
                                    <p className="text-red-500 font-black text-xs uppercase">{t.type}</p>
                                    <p className="text-gray-400 text-[10px] mt-1">{t.userAgent}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold text-xs">{new Date(t.time).toLocaleTimeString()}</p>
                                    <p className="text-red-400 text-[10px] uppercase font-bold">{t.path}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                <h3 className="font-black text-xs uppercase text-gray-500 mb-6 tracking-widest">Estado del Sistema</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 uppercase font-bold">Relés Activos</span>
                        <span className="text-green-400 font-black">3/3</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 uppercase font-bold">Cifrado SEA</span>
                        <span className="text-blue-400 font-black">ACTIVO</span>
                    </div>
                    <button onClick={() => gun.get('intrusion_logs').put(null)} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-[10px] font-black uppercase transition-all mt-4">Borrar Evidencias</button>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
