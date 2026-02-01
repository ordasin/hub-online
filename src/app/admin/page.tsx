'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, AlertCircle, Trash2, Send, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [sysLog, setSysLog] = useState<string[]>([])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const Gun = (await import('gun')).default;
        await import('gun/sea');
        
        // Admin SI usa localStorage para que el test sea instantáneo
        const g = Gun({ 
          peers: PEERS,
          localStorage: true 
        });
        setGun(g);
        
        const user = (g as any).user().recall({ sessionStorage: true });
        if (user.is && user.is.pub === MASTER_PUB) {
          setIsAdmin(true);
          setSysLog(prev => [...prev, "Autenticación Maestra: OK"]);
        } else {
          if (typeof window !== 'undefined') window.location.href = '/login';
        }

        // Escucha ultra-sensible
        g.get('CORE_SECURITY_V4').map().on((data: any, id: string) => {
          if (data && data.time) {
            setThreats(prev => {
              if (prev.find(t => t.id === id)) return prev;
              
              if (data.time > Date.now() - 20000) {
                toast.error("¡DETECCIÓN EN TIEMPO REAL!");
              }
              return [{ ...data, id }, ...prev].sort((a,b) => b.time - a.time).slice(0, 50);
            });
          }
        });

        setSysLog(prev => [...prev, "Red P2P Inicializada"]);
      } catch (err) {
        setSysLog(prev => [...prev, "Error: " + err]);
      }
    };
    init();
  }, [])

  const testSelf = () => {
    if (gun) {
      const id = 'test-' + Date.now();
      gun.get('CORE_SECURITY_V4').get(id).put({
        id,
        type: 'INTERNAL_TEST',
        details: 'Prueba de pulso local',
        time: Date.now()
      });
      toast.info("Pulso enviado");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[3rem] bg-red-900/10 border-2 border-red-600/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Shield className="text-red-500 animate-pulse" size={32} />
                    <h1 className="text-2xl font-black uppercase">Monitor V4</h1>
                </div>
                <button onClick={testSelf} className="px-6 py-2 bg-white text-black text-[10px] font-black rounded-full hover:bg-red-500 hover:text-white transition-all">PULSO DE TEST</button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Logs de Seguridad</h2>
                    <button onClick={() => gun.get('CORE_SECURITY_V4').put(null)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {threats.map((t) => (
                        <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]" />
                                <span className="text-xs font-black uppercase">{t.type}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-[10px] font-black uppercase tracking-widest animate-pulse">Escaneando red...</p>}
                </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-[2rem] bg-black border border-white/5 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Terminal size={14}/> System Console</h2>
                <div className="space-y-1 overflow-hidden">
                    {sysLog.map((log, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {log}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} _</p>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}