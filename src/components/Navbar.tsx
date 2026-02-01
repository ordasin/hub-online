'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [userState, setUserState] = useState({ logged: false, name: "", isAdmin: false })

  useEffect(() => {
    const checkSession = () => {
      // @ts-ignore
      if (!window.Gun) return;
      // @ts-ignore
      const gun = window.Gun(['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun']);
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });

      if (user.is) {
        setUserState({
          logged: true,
          name: user.is.alias,
          // BYPASS TOTAL: Si tu nombre es ordasin, eres ADMIN.
          isAdmin: user.is.alias === 'ordasin'
        });
      }
    };

    const timer = setInterval(checkSession, 1000);
    return () => clearInterval(timer);
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-purple-500/10"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">O</div>
          <div className="hidden sm:block">
            <span className="font-black tracking-tighter text-lg text-white block leading-none uppercase">Ordasin</span>
            <span className="text-[8px] text-purple-400 font-bold uppercase tracking-widest">Hub Online</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-3 py-2 transition-colors">
            <LayoutGrid size={14} /> <span className="hidden xs:block">Proyectos</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white px-3 py-2 transition-colors">
            <Zap size={14} className="text-yellow-500" /> <span className="hidden xs:block text-white">Chat</span>
          </Link>
          
          {userState.isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-white px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert size={14} /> <span>ADMIN</span>
            </Link>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-3">
            <Link href="https://discord.gg/dehYH7AQ" target="_blank" className="p-2 rounded-full bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 hover:bg-[#5865F2] hover:text-white transition-all"><MessageCircle size={16} /></Link>
            <Link 
              href={userState.logged ? "/profile" : "/login"} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold ${userState.logged ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white text-black hover:bg-purple-500 hover:text-white'}`}
            >
              <User size={14} className={userState.logged ? 'text-purple-400' : ''} /> <span>{userState.logged ? userState.name : 'Entrar'}</span>
            </Link>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}