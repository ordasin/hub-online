'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

// TU NUEVA LLAVE MAESTRA SEGURA
const MASTER_PUB = "IeQAyAqaP7rRcawgSuWVk-o_fyV6LFDP30TT1SUw2o0.RXvyZfsOjd13y-RoO_es4RwuzHYoxAzu9VQeeUmzPU8";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export function Navbar() {
  const [session, setSession] = useState({ logged: false, name: "", isAdmin: false })

  useEffect(() => {
    const sync = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: PEERS, localStorage: true });
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });

      if (user.is) {
        setSession({
          logged: true,
          name: user.is.alias,
          // VALIDACIÓN CRIPTOGRÁFICA REAL
          isAdmin: user.is.pub === MASTER_PUB
        });
      } else {
        setSession({ logged: false, name: "", isAdmin: false });
      }
    };

    const interval = setInterval(sync, 2000);
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
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center font-black text-white">O</div>
          <span className="font-black text-white uppercase hidden sm:block tracking-tighter">Ordasin Hub</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors"><LayoutGrid size={18}/></Link>
          <Link href="/chat" className="text-gray-400 hover:text-white transition-colors"><Zap size={18} className="text-yellow-500"/></Link>
          
          {session.isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-red-400 border border-red-500/30 px-4 py-2 rounded-full bg-red-500/10 animate-pulse">
              <ShieldAlert size={14} /> ADMIN_ZONE
            </Link>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          
          <Link href={session.logged ? "/profile" : "/login"} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white text-xs font-black hover:bg-white hover:text-black transition-all">
            <User size={14} /> <span>{session.logged ? session.name : 'Entrar'}</span>
          </Link>
        </div>
      </motion.nav>
    </div>
  )
}
