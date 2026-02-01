'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
// CAMBIO A RELÉ DE CONFIANZA TOTAL
const RELAY_URL = 'https://relay.gun.eco/gun';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [status, setStatus] = useState('Iniciando...')
  const [netDiag, setNetDiag] = useState('Esperando...')

  useEffect(() => {
    let gun: any = null;

    const init = () => {
      // @ts-ignore
      if (!window.Gun) return;
      // @ts-ignore
      gun = window.Gun({
        peers: [RELAY_URL],
        localStorage: true
      });

      gun.on('hi', () => {
        setPeers(p => p + 1);
        setStatus('Sincronizado con Red Global');
        setNetDiag("Conexión P2P Establecida");
      });

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      gun.get('ORDASIN_SEC_CORE_V10').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("AMENAZA DETECTADA");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });
    };

    const checkLoader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(checkLoader);
      }
    }, 1000);
    return () => clearInterval(checkLoader);
  }, [])

  const checkNetwork = async () => {
    setNetDiag("Intentando Bypass de Navegador...");
    try {
      const res = await fetch(RELAY_URL);
      if (res.ok || res.status === 404 || res.status === 400) {
        setNetDiag("Servidor de Élite: ACCESIBLE");
        toast.success("Bypass Exitoso");
      }
    } catch (e) {
      setNetDiag("BLOQUEO PERSISTENTE: Intenta desactivar extensiones");
      toast.error("Error Crítico de Red");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white">Vigilance Master</h1>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                {peers > 0 ? <Wifi className="text-green-400" size={14}/> : <WifiOff className="text-red-500 animate-pulse" size={14}/>}
                <span>RED: {peers > 0 ? 'CONECTADA' : 'BUSCANDO...'} ({peers})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Amenazas</h2>
                <div className="grid grid-cols-1 gap-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Captura de Inyección</span>
                            <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-[10px] font-black uppercase">Escaneando red mundial...</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Estado del Nodo</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] space-y-4 shadow-xl">
                    <p className="text-[9px] text-green-500 font-bold leading-relaxed">{">"} {netDiag}</p>
                    <button onClick={checkNetwork} className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">
                        BYPASS TEST
                    </button>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                    <RefreshCw size={14}/> Reiniciar Red
                </button>
            </div>
        </div>
      </div>
    </main>
  )
}
