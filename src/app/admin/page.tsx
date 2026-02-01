'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, Trash2, RefreshCw, HardDriveDownload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [netDiag, setNetDiag] = useState('Buscando señal...')
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    let gunInstance: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      // Iniciamos Gun con configuración de máxima compatibilidad
      gunInstance = Gun({
        peers: PEERS,
        localStorage: true,
        retry: 1000
      });
      setGun(gunInstance);

      gunInstance.on('hi', () => {
        setPeers(p => p + 1);
        setNetDiag("RED P2P: ACTIVA");
      });

      // @ts-ignore
      const user = gunInstance.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      gunInstance.get('ORDASIN_SEC_V7').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("AMENAZA DETECTADA");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
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
    }, 500);
    return () => clearInterval(loader);
  }, [])

  const hardReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="p-8 border border-white/10 bg-black rounded-3xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase">Monitor de Seguridad</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={hardReset} className="px-4 py-2 bg-red-600/10 text-red-500 rounded-full text-[10px] font-black border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">
                RESETEAR CACHÉ
            </button>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-black flex items-center gap-2">
                <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500 animate-bounce"}/>
                <span>{peers > 0 ? 'CONECTADO' : netDiag} ({peers})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-bold text-[10px] uppercase">Señal de Intrusión</span>
                    <span className="text-white text-[10px] font-bold">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-700 text-xs font-black uppercase tracking-widest animate-pulse">Vigilando red P2P...</p>
                    <p className="text-[9px] text-gray-800 mt-2">Si el contador sigue en 0, prueba a desactivar extensiones de privacidad.</p>
                </div>
            )}
        </div>
      </div>
    </main>
  )
}