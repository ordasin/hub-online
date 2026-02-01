'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, AlertTriangle, Trash2, Home, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
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
        setIsConnected(true);
        toast.success("CONEXIÓN ESTABLECIDA CON LA RED P2P");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // Escuchar logs de forma persistente
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const exists = prev.find(t => t.id === data.id);
            if (exists) return prev;
            return [data, ...prev].sort((a,b) => b.time - a.time).slice(0, 15);
          });
        }
      });

      // Escuchar última amenaza para notificación
      g.get('latest_threat').on((data: any) => {
        if (data && data.time > Date.now() - 10000) {
          toast.error(`!!! ALERTA DE SEGURIDAD !!!`, {
            description: `${data.type}: ${data.path}`,
            duration: 6000
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
        
        {/* Network Status Bar */}
        <div className="flex justify-between items-center px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
                {isConnected ? <Wifi className="text-green-500" size={14}/> : <WifiOff className="text-red-500" size={14}/>}
                <span>Red P2P: {isConnected ? 'Sincronizada' : 'Conectando...'}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-gray-500">NODO MAESTRO: {MASTER_PUB.substring(0, 10)}...</span>
            </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-900/20 to-black border-2 border-red-600/20 backdrop-blur-xl">
          <div className="flex items-center gap-6 mb-12">
            <Shield size={48} className="text-red-600 animate-pulse" />
            <h1 className="text-4xl font-black uppercase tracking-tighter">Command & Control</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400">
              <Activity size={18} /> Monitor de Intrusión
            </h2>
            <div className="space-y-2">
              {threats.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Escaneando red en busca de firmas de ataque...</p>
                </div>
              )}
              <AnimatePresence>
                {threats.map((t) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:border-red-500/50 transition-colors">
                    <div>
                      <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md mr-4 uppercase">{t.type}</span>
                      <span className="text-gray-400 text-[10px] font-bold">{t.userAgent.substring(0, 60)}</span>
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
        </div>

        <div className="flex gap-4">
            <button onClick={() => gun.get('intrusion_logs').put(null)} className="flex-1 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase text-red-400 hover:bg-red-600/20 transition-all">Limpiar Historial</button>
            <button onClick={() => window.location.href = '/'} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all">Ir al Hub</button>
        </div>
      </div>
    </main>
  )
}