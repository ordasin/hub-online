'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, ShieldAlert, Lock, UserCheck, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [peers, setPeers] = useState(0)
  const [threats, setThreats] = useState<any[]>([])
  const [currentPub, setCurrentPub] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ peers: PEERS, localStorage: true });
      g.on('hi', () => setPeers(p => p + 1));

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      
      const check = () => {
        if (user.is) {
          setUserName(user.is.alias);
          setCurrentPub(user.is.pub);
          // PERMITIR POR NOMBRE O POR LLAVE (Bypass de recuperación)
          if (user.is.pub === MASTER_PUB || user.is.alias === 'ordasin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setTimeout(() => { if (!user.is) setIsAdmin(false); }, 2000);
        }
      };

      check();
      g.on('auth', check);

      g.get('ORDASIN_SEC_V7').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => [data, ...prev.filter(t => t.id !== id)].slice(0, 20));
        }
      });
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) { init(); clearInterval(loader); }
    }, 500);
    return () => clearInterval(loader);
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-gray-500 uppercase text-[10px]">Sincronizando Identidad...</div>;

  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-10 text-center uppercase font-black">Acceso Denegado</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* PANEL DE RECUPERACIÓN (Solo si la llave no coincide) */}
        {currentPub !== MASTER_PUB && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-red-600 rounded-[2.5rem] border-4 border-white shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <div className="flex items-center gap-4 mb-4 text-white">
                    <ShieldAlert size={32} />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Modo Recuperación Activo</h2>
                </div>
                <p className="text-sm font-bold text-white/90 mb-6 uppercase">Tu llave antigua no coincide. Copia tu NUEVA LLAVE y dásela a la IA:</p>
                <div className="p-4 bg-black/40 rounded-xl flex items-center justify-between gap-4">
                    <code className="text-[10px] break-all text-white font-bold">{currentPub}</code>
                    <button onClick={() => { navigator.clipboard.writeText(currentPub); toast.success("Copiado"); }} className="p-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all"><Copy size={16}/></button>
                </div>
            </motion.div>
        )}

        <div className="p-10 border-2 border-red-600/20 bg-red-950/10 rounded-[3rem] flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-6">
            <UserCheck className="text-green-500" size={40} />
            <div>
                <h1 className="text-3xl font-black uppercase italic tracking-widest">{userName} @ ADMIN</h1>
                <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-2">
                    <Wifi size={12} className={peers > 0 ? 'text-green-500' : 'text-red-500'} />
                    NODOS P2P: {peers}
                </p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all uppercase">Escritorio</button>
        </div>

        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-xs font-black uppercase text-gray-500 tracking-widest px-2">Amenazas Detectadas</h2>
            <div className="space-y-2">
                {threats.map(t => (
                    <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                        <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Alerta Capturada</span>
                        <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                    </div>
                ))}
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Escaneando red mundial...</p>}
            </div>
        </div>
      </div>
    </main>
  )
}