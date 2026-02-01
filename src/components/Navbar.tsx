'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [session, setSession] = useState({ logged: false, name: "", isOrdasin: false })

  useEffect(() => {
    const sync = () => {
      if (typeof window === 'undefined') return;
      
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      // Usar la misma instancia de memoria
      const gun = Gun({ peers: ['https://relay.gun.eco/gun'], localStorage: true });
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });

      if (user.is) {
        setSession({
          logged: true,
          name: user.is.alias,
          // SI TU NOMBRE ES ORDASIN, TIENES PODERES DE ADMIN
          isOrdasin: user.is.alias === 'ordasin'
        });
      } else {
        setSession({ logged: false, name: "", isOrdasin: false });
      }
    };

    // Sincronizar cada segundo para detectar cambios de login
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6 font-mono">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-purple-500/10"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">O</div>
          <div className="hidden sm:block">
            <span className="font-black tracking-tighter text-lg text-white block leading-none uppercase">Ordasin</span>
            <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">
                {session.logged ? `USER: ${session.name}` : 'NETWORK_READY'}
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-3 py-2 transition-colors">
            <LayoutGrid size={14} /> <span className="hidden xs:block">Proyectos</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-3 py-2 transition-colors">
            <Zap size={14} className="text-yellow-500" /> <span className="hidden xs:block text-white">Chat</span>
          </Link>
          
          {/* BOTÓN ROJO MAESTRO */}
          {session.isOrdasin && (
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-white px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <ShieldAlert size={14} /> <span>ADMIN_CONSOLE</span>
            </Link>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-3">
            <Link href="https://discord.gg/dehYH7AQ" target="_blank" className="p-2 rounded-full bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 hover:bg-[#5865F2] hover:text-white transition-all"><MessageCircle size={16} /></Link>
            <Link 
              href={session.logged ? "/profile" : "/login"} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-black ${session.logged ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white text-black hover:bg-purple-500 hover:text-white'}`}
            >
              <User size={14} className={session.logged ? 'text-purple-400' : ''} /> <span>{session.logged ? session.name : 'Entrar'}</span>
            </Link>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}