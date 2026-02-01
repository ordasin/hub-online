'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, AlertCircle, Trash2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [netStatus, setStatus] = useState('Iniciando...')
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      
      const g = Gun({ 
        peers: PEERS,
        webRTC: false, // Forzamos WebSockets para máxima compatibilidad
        localStorage: false 
      });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        setStatus('Conectado a Red P2P');
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // ESCUCHA ACTIVA
      g.get('SEC_PULSE_V2').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            
            // Notificación sonora/visual
            if (data.time > Date.now() - 10000) {
              toast.error("!!! AMENAZA DETECTADA !!!", {
                description: `${data.type}: ${data.details}`,
                duration: 5000
              });
            }
            return [{ ...data, id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };
    init();
  }, [])

  const testConnection = () => {
    if (gun) {
      const testId = 'test-' + Date.now();
      const testLog = {
        id: testId,
        type: 'AUTO_TEST',
        details: 'Prueba de pulso del sistema',
        time: Date.now()
      };
      gun.get('SEC_PULSE_V2').get(testId).put(testLog);
      toast.info("Enviando pulso de prueba a la red...");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Network Monitor */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Shield className="text-purple-500" size={24} />
                <h1 className="font-black uppercase tracking-widest text-sm">Control de Vigilancia</h1>
            </div>
            <div className="flex gap-4">
                <button onClick={testConnection} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-[10px] font-black hover:bg-blue-500 transition-all">
                    <Send size={12}/> TEST RED
                </button>
                <div className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold text-green-400 border border-green-500/20">
                    {netStatus}
                </div>
            </div>
        </div>

        {/* Threat Intel */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Intelligence Feed</h2>
                <button onClick={() => gun.get('SEC_PULSE_V2').put(null)} className="text-red-500 hover:text-red-400 transition-colors">
                    <Trash2 size={16}/>
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                    {threats.map((t) => (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={t.id} className="p-5 bg-red-950/10 border border-red-900/20 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <AlertCircle className="text-red-500" size={20} />
                                <div>
                                    <p className="text-red-500 font-black text-xs uppercase">{t.type}</p>
                                    <p className="text-gray-500 text-[9px] font-bold mt-1">{t.details}</p>
                                </div>
                            </div>
                            <p className="text-white font-black text-xs">{new Date(t.time).toLocaleTimeString()}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {threats.length === 0 && <div className="py-20 text-center border border-white/5 rounded-3xl text-gray-700 text-[10px] font-black uppercase tracking-widest animate-pulse">Escuchando red P2P...</div>}
            </div>
        </div>
      </div>
    </main>
  )
}
