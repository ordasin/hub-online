'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [session, setSession] = useState({ logged: false, name: "", isAdmin: false })

  useEffect(() => {
    const sync = () => {
      if (typeof window === 'undefined') return;
      
      // 1. Verificación local rápida
      const localUser = localStorage.getItem('last_logged_user');
      
      // @ts-ignore
      const Gun = window.Gun;
      if (Gun) {
        const gun = Gun(['https://relay.gun.eco/gun'], { localStorage: true });
        // @ts-ignore
        const user = gun.user().recall({ sessionStorage: true });

        if (user.is) {
          setSession({
            logged: true,
            name: user.is.alias,
            isAdmin: user.is.alias === 'ordasin'
          });
          localStorage.setItem('last_logged_user', user.is.alias);
          return;
        }
      }

      // Si no hay Gun pero detectamos el nombre local
      if (localUser === 'ordasin') {
        setSession({ logged: true, name: 'ordasin', isAdmin: true });
      } else {
        setSession({ logged: false, name: "", isAdmin: false });
      }
    };

    const interval = setInterval(sync, 1500);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6 font-mono">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">O</div>
          <span className="font-black text-white uppercase hidden sm:block tracking-tighter italic">Ordasin Hub</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors"><LayoutGrid size={18}/></Link>
          <Link href="/chat" className="text-gray-400 hover:text-white transition-colors"><Zap size={18} className="text-yellow-500"/></Link>
          
          {session.isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-red-400 border border-red-500/30 px-4 py-2 rounded-full bg-red-500/10 animate-pulse shadow-lg shadow-red-900/20">
              <ShieldAlert size={14} /> ADMIN
            </Link>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
          
          <Link href={session.logged ? "/profile" : "/login"} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white text-xs font-black hover:bg-white hover:text-black transition-all">
            <User size={14} /> <span>{session.logged ? session.name : 'Entrar'}</span>
          </Link>
        </div>
      </motion.nav>
    </div>
  )
}
