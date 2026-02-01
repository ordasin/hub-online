'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, RefreshCw, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEER = 'https://gun-manhattan.herokuapp.com/gun';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["INICIANDO..."])
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ 
        peers: [PEER],
        localStorage: true 
      });
      setGun(g);

      g.on('hi', () => {
        setPeers(p => p + 1);
        setDiag(prev => ["CONECTADO A MANHATTAN", ...prev].slice(0, 5));
      });

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);

      // ESCUCHA DEL CANAL VIGILANCE_V1
      g.get('VIGILANCE_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) toast.error("¡AMENAZA DETECTADA!");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(loader);
      }
    }, 1000);
    return () => clearInterval(loader);
  }, [])

  const testRed = () => {
    if (gun) {
      const id = 'test-' + Date.now();
      gun.get('VIGILANCE_V1').get(id).put({ id, type: 'TEST', time: Date.now() });
      toast.info("Pulso enviado");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-500 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase">Monitor de Seguridad</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={testRed} className="px-4 py-2 bg-blue-600 rounded-full text-[10px] font-black hover:bg-blue-500 transition-all flex items-center gap-2"><Send size={12}/> TEST</button>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
                <span>NODOS: {peers}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Amenazas</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-[10px] uppercase">ALERTA_DETECCION</span>
                            <span className="text-white text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-[10px] font-black">RED EN SILENCIO</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Diagnóstico</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] h-64 space-y-1">
                    {diag.map((d, i) => <p key={i} className="text-[9px] text-green-500/70">{">"} {d}</p>)}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} _</p>
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}
