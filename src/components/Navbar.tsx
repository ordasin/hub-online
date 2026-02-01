'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      // REGLA DE RESCATE: Si el usuario guardado localmente es 'ordasin' 
      // o si forzamos la marca manual, activamos el botón.
      const localUser = localStorage.getItem('last_logged_user');
      const forceAdmin = localStorage.getItem('force_admin_mode') === 'true';

      if (localUser === 'ordasin' || forceAdmin) {
        setIsAdmin(true);
        setUserName('ordasin');
      }

      // Intentar sincronizar con Gun si está disponible
      // @ts-ignore
      const Gun = window.Gun;
      if (Gun) {
        const gun = Gun(['https://relay.gun.eco/gun']);
        // @ts-ignore
        const user = gun.user().recall({ sessionStorage: true });
        if (user.is) {
          setUserName(user.is.alias);
          if (user.is.alias === 'ordasin') {
            setIsAdmin(true);
            localStorage.setItem('last_logged_user', 'ordasin');
          }
        }
      }
    };

    const timer = setInterval(checkAuth, 1000);
    return () => clearInterval(timer);
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6 font-mono">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">O</div>
          <span className="font-black text-white uppercase hidden sm:block">Ordasin Hub</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors"><LayoutGrid size={18}/></Link>
          <Link href="/chat" className="text-gray-400 hover:text-white transition-colors"><Zap size={18} className="text-yellow-500"/></Link>
          
          {/* BOTÓN DE EMERGENCIA */}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-red-400 border border-red-500/30 px-4 py-2 rounded-full bg-red-500/10 animate-pulse">
              <ShieldAlert size={14} /> ADMIN
            </Link>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-black">
            <User size={14} /> <span>{userName || 'Entrar'}</span>
          </Link>
        </div>
      </motion.nav>
    </div>
  )
}
