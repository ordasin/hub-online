'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Activity, Users, Ban, XCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [newProject, setNewProject] = useState({ title: '', version: '' })
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [threats, setThreats] = useState<any[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar TODAS las intrusiones
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== data.id);
            const newList = [data, ...filtered].sort((a,b) => b.time - a.time);
            return newList.slice(0, 10);
          });
        }
      });

      // Alerta especial para la última amenaza detectada
      g.get('latest_threat').on((data: any) => {
        if (data) toast.error(`¡ALERTA! Intento de ${data.type} detectado`, {
            description: `Ruta: ${data.path}`,
            duration: 5000
        });
      });

      // Usuarios Online
      g.get('online_users').map().once((time: number) => {
        if (Date.now() - time < 30000) setOnlineCount(prev => prev + 1);
      });
    };

    if (typeof window !== 'undefined') initAdmin();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Left */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 backdrop-blur-xl flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Shield size={48} className="text-red-500 animate-pulse" />
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Command Hub</h1>
                    <p className="text-xs font-bold text-gray-500">Security Node Active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-green-400">{onlineCount}</p>
                <p className="text-[10px] uppercase font-bold text-gray-600">Peers Online</p>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" /> Historial de Amenazas
                </h2>
                <div className="space-y-4">
                    {threats.length === 0 && <p className="text-gray-600 italic text-sm text-center py-10">No se han registrado ataques todavía.</p>}
                    <AnimatePresence>
                        {threats.map((t) => (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-red-400 font-black text-xs">[{t.type}]</p>
                                    <p className="text-gray-400 text-[10px] font-mono mt-1">{t.userAgent}</p>
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

          {/* Sidebar Admin */}
          <div className="space-y-8">
            <div className="p-8 rounded-[3rem] bg-purple-900/10 border border-purple-500/20 backdrop-blur-xl">
                <h3 className="font-black text-xs uppercase tracking-widest mb-6">Acciones Rápidas</h3>
                <button onClick={() => gun.get('intrusion_logs').put(null)} className="w-full py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase transition-all mb-4">Limpiar Logs</button>
                <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-purple-500 hover:text-white transition-all">Ir al Hub</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}