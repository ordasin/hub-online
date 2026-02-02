'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, Lock, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      // BYPASS DE EMERGENCIA
      const isMasterForce = localStorage.getItem('master_admin_bypass') === 'true';
      
      // @ts-ignore
      const Gun = window.Gun;
      if (Gun) {
        const gun = Gun(['https://relay.gun.eco/gun'], { localStorage: true });
        // @ts-ignore
        const user = gun.user().recall({ sessionStorage: true });

        if (user.is || isMasterForce) {
          setIsAdmin(true);
          // Iniciar escucha de red si hay Gun
          gun.on('hi', () => setPeers(p => p + 1));
          gun.get('ORDASIN_SEC_V10').map().on((data: any, id: string) => {
            if (data && data.time) {
              setThreats(prev => [data, ...prev.filter(t => t.id !== id)].slice(0, 20));
            }
          });
        } else {
          setIsAdmin(false);
        }
      } else if (isMasterForce) {
        setIsAdmin(true);
      }
    };

    checkAuth();
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white animate-pulse uppercase text-xs">Cargando Módulos de Seguridad...</div>;
  
  if (isAdmin === false) return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 text-center font-mono">
        <div className="space-y-4">
            <Lock size={48} className="mx-auto" />
            <h1 className="text-xl font-black uppercase tracking-widest">Acceso Denegado</h1>
            <button onClick={() => window.location.href='/login'} className="px-6 py-2 bg-white text-black font-black rounded-lg text-xs">Volver al Login</button>
        </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 border-2 border-red-600/20 bg-red-950/10 rounded-[3rem] flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <UserCheck className="text-green-500" size={40} />
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic">Admin Rescue Mode</h1>
                <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-2">
                    <Wifi size={12} className={peers > 0 ? 'text-green-500' : 'text-red-500'} />
                    NODOS P2P: {peers}
                </p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all uppercase">Escritorio</button>
        </div>

        <div className="p-10 border border-white/10 rounded-[3rem] bg-white/5 space-y-6">
            <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400">
                <ShieldAlert size={20} /> Recuperación de Identidad
            </h2>
            <p className="text-sm text-gray-400">
                Has entrado mediante el bypass de emergencia. Para que el sistema te reconozca siempre, abre la consola (F12) y escribe: <br/>
                <code className="text-white bg-black p-1 rounded">localStorage.getItem(&apos;gun/auth&apos;)</code>
            </p>
        </div>
      </div>
    </main>
  )
}