'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, User, ShieldAlert, Users, Globe, Menu, X, Wifi } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// NUEVA LISTA DE RELÉS DE ÉLITE (Más estables)
const PEERS = [
  'wss://gun.v6.rocks/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export function Navbar() {
  const [session, setSession] = useState({ logged: false, name: "", isAdmin: false })
  const [peers, setPeers] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      if (typeof window === 'undefined') return;
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: PEERS, localStorage: true, retry: 1000 });
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });

      gun.on('hi', () => setPeers(p => p + 1));
      gun.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      if (user.is) {
        setSession({
          logged: true,
          name: user.is.alias,
          isAdmin: user.is.pub === "_VFsB7wZfL0sqU6GGW5ucTjkBOazp-CR6B4_52-1rOY.iNt-9rXPnGyZbTXfk2AyqVtnATVgEAU_dbCoOySYT4w"
        });
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
        className="max-w-7xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-[2rem] px-6 py-3 flex justify-between items-center shadow-2xl shadow-purple-500/10"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">O</div>
          <div className="hidden sm:block">
            <span className="font-black text-white uppercase tracking-tighter text-lg leading-none block">Ordasin</span>
            <div className="flex items-center gap-1 mt-0.5">
                <Wifi size={8} className={peers > 0 ? 'text-green-500 animate-pulse' : 'text-red-500'} />
                <span className="text-[7px] text-gray-500 font-black uppercase tracking-[0.2em]">{peers > 0 ? 'Linked' : 'Syncing'}</span>
            </div>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-2">
          <NavLink href="/" icon={<LayoutGrid size={16}/>} label="Proyectos" />
          <NavLink href="/chat" icon={<Zap size={16} className="text-yellow-500"/>} label="Chat P2P" />
          <NavLink href="/community" icon={<Users size={16}/>} label="Comunidad" />
          
          {session.isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-red-400 border border-red-500/30 px-4 py-2 rounded-full bg-red-500/10 animate-pulse">
              <ShieldAlert size={14} /> MASTER_NODE
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={session.logged ? "/profile" : "/login"} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${
                session.logged ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-lg'
            }`}
          >
            <User size={14} className={session.logged ? 'text-purple-400' : ''} />
            <span>{session.logged ? session.name : 'Entrar'}</span>
          </Link>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-400">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden absolute top-24 left-6 right-6 p-6 rounded-[2rem] bg-black/90 border border-white/10 backdrop-blur-2xl shadow-3xl space-y-4">
            <MobileNavLink href="/" label="Proyectos" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/chat" label="Chat P2P" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/community" label="Comunidad" onClick={() => setIsMobileMenuOpen(false)} />
            {session.isAdmin && <MobileNavLink href="/admin" label="ADMIN_PANEL" color="text-red-400" onClick={() => setIsMobileMenuOpen(false)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
      {icon} <span>{label}</span>
    </Link>
  )
}

function MobileNavLink({ href, label, color = "text-white", onClick }: { href: string, label: string, color?: string, onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`block w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 font-black uppercase text-xs tracking-[0.2em] ${color}`}>
      {label}
    </Link>
  )
}
