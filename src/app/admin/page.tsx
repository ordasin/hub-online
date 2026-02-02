'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Package, Plus, Trash2, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const check = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;
      // @ts-ignore
      const gun = Gun(['https://relay.gun.eco/gun']);
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });

      if (user.is) {
        setUserName(user.is.alias);
        if (user.is.alias === 'ordasin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        // Bypass local si Gun tarda
        const localUser = localStorage.getItem('last_logged_user');
        if (localUser === 'ordasin') {
            setIsAdmin(true);
            setUserName('ordasin');
        } else {
            setTimeout(() => { if (!user.is) setIsAdmin(false); }, 3000);
        }
      }
    };

    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white animate-pulse uppercase text-xs">Autenticando Nodo Maestro...</div>;
  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black p-10 text-center uppercase tracking-widest">Acceso Denegado</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 border-2 border-red-600/20 bg-red-950/5 rounded-[3rem] flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-6">
            <Shield className="text-red-600 animate-pulse" size={40} />
            <div>
                <h1 className="text-3xl font-black uppercase italic tracking-widest">{userName} @ HUB ADMIN</h1>
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.3em]">Estado: Control Total</p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all uppercase">Escritorio</button>
        </div>

        <div className="p-10 border border-white/10 rounded-[3rem] bg-white/5 text-center">
            <Activity size={48} className="mx-auto text-purple-500 mb-6" />
            <h2 className="text-xl font-black uppercase mb-4">Panel de Control Activo</h2>
            <p className="text-gray-500 text-sm italic">Has recuperado el acceso. El sistema vuelve a estar bajo tu mando.</p>
        </div>
      </div>
    </main>
  )
}
