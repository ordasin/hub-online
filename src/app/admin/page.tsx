'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const RELAY_URL = 'https://gun-manhattan.herokuapp.com/gun';

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
      if (!window.Gun) {
        setStatus('Librería no cargada');
        return;
      }

      // @ts-ignore
      gun = window.Gun({
        peers: [RELAY_URL],
        localStorage: true
      });

      gun.on('hi', () => {
        setPeers(p => p + 1);
        setStatus('Sincronizado');
      });

      gun.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      gun.get('ORDASIN_SEC_V6').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
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
    setNetDiag("Probando conexión directa...");
    try {
      const res = await fetch(RELAY_URL);
      if (res.ok || res.status === 404) {
        setNetDiag("Servidor Visible: OK");
        toast.success("El servidor de seguridad responde");
      } else {
        setNetDiag("Error de Servidor: " + res.status);
      }
    } catch (e) {
      setNetDiag("BLOQUEADO POR NAVEGADOR");
      toast.error("Tu navegador está bloqueando la conexión");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Watcher Center</h1>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                {peers > 0 ? <Wifi className="text-green-400" size={14}/> : <WifiOff className="text-red-500" size={14}/>}
                <span>NODOS: {peers} ({status})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Historial de Alertas</h2>
                <div className="grid grid-cols-1 gap-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                            <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Alerta de Seguridad</span>
                            <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-[10px] font-black uppercase animate-pulse">Escaneando red mundial...</p>}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Diagnóstico de Red</h2>
                <div className="p-6 bg-black border border-white/10 rounded-[2rem] space-y-4">
                    <p className="text-[10px] text-green-500 font-bold leading-relaxed">{">"} {netDiag}</p>
                    <button onClick={checkNetwork} className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">
                        PROBAR CONEXIÓN
                    </button>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                    <RefreshCw size={14}/> Reiniciar Monitor
                </button>
            </div>
        </div>
      </div>
    </main>
  )
}