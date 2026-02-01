'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Github, LayoutGrid, Users, MessageCircle, Zap, User } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Importación dinámica de Gun solo en el cliente
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      const user = (gun as any).user().recall({ sessionStorage: true });

      const checkUser = () => {
        if (user.is) {
          setIsLoggedIn(true);
          setUserName(user.is.alias);
        }
      };

      checkUser();
      gun.on('auth', checkUser);
    };

    if (typeof window !== 'undefined') {
      initGun();
    }
  }, [])

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-purple-500/10"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">
            O
          </div>
          <div className="hidden sm:block">
            <span className="font-black tracking-tighter text-lg text-white block leading-none">ORDASIN</span>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em]">Hub Online</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
            <LayoutGrid size={16} />
            <span className="hidden xs:block">Proyectos</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
            <Zap size={16} className="text-yellow-500" />
            <span className="hidden xs:block">Chat P2P</span>
          </Link>
          <Link href="/community" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors">
            <Users size={16} />
            <span className="hidden xs:block">Comunidad</span>
          </Link>
          
          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <Link 
              href={isLoggedIn ? "/profile" : "/login"} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-bold ${
                isLoggedIn 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <User size={16} className={isLoggedIn ? 'text-purple-400' : 'text-gray-400'} />
              <span>{isLoggedIn ? userName : 'Entrar'}</span>
            </Link>
            
            <Link 
              href="https://discord.gg/dehYH7AQ" 
              target="_blank"
              className="p-2 rounded-full bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 hover:bg-[#5865F2] hover:text-white transition-all"
            >
              <MessageCircle size={18} />
            </Link>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}