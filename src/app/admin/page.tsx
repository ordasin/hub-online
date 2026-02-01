'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, AlertTriangle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEER_LIST = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gunjs.herokuapp.com/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [diag, setDiag] = useState<string[]>(["Iniciando diagnóstico..."])

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) {
        setDiag(prev => [...prev, "ERROR: Librería Gun no detectada en window"]);
        return;
      }

      setDiag(prev => [...prev, "Conectando a relés globales..."]);
      
      gun = Gun({ 
        peers: PEER_LIST,
        localStorage: false // Usar RAM para evitar bloqueos
      });

      gun.on('hi', (peer: any) => {
        setPeers(p => p + 1);
        setDiag(prev => [...prev, `Conectado a: ${peer.url || 'Nodo desconocido'}`]);
      });

      gun.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // Escucha de amenazas
      gun.get('GLOBAL_MONITOR_V1').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("AMENAZA DETECTADA");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    // Esperar carga de script
    const checkLoader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(checkLoader);
      }
    }, 1000);

    return () => clearInterval(checkLoader);
  }, [])

  if (!isAdmin && typeof window !== 'undefined') {
    // Verificación manual simple para el test si Gun no ha cargado SEA
    const session = sessionStorage.getItem('gun/auth');
    if (!session && !isAdmin) {
        // Dejamos ver la UI de admin para el test de red aunque no estemos logueados como master
        // solo para que el usuario vea el contador de nodos
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="p-8 border border-red-600/20 bg-red-900/5 rounded-[2.5rem] flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase italic">Centro de Vigilancia</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black uppercase">
            <Wifi size={14} className={peers > 0 ? "text-green-400 animate-bounce" : "text-red-500"}/>
            <span>Nodos Activos: {peers}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Amenazas Recientes</h2>
                <div className="space-y-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-xs uppercase">{t.type || 'ALERTA'}</span>
                            <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black">Silencio en la red...</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Consola de Red</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] h-64 overflow-y-auto space-y-1 scrollbar-hide">
                    {diag.map((d, i) => (
                        <p key={i} className="text-[9px] text-green-500/70">{">"} {d}</p>
                    ))}
                    <p className="text-[9px] text-green-400 animate-pulse">{">"} _</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={12}/> Reiniciar Conexión
                </button>
            </div>
        </div>
      </div>
    </main>
  )
}
