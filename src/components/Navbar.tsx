'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const PEERS = [
  'wss://gun.v6.rocks/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<unknown>(null)
  const [gun, setGun] = useState<unknown>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const initGun = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const g = Gun({ peers: PEERS, localStorage: true });
      setGun(g);
      // @ts-expect-error Gun types not available
      const u = g.user().recall({ sessionStorage: true });
      setUser(u);

      g.on('auth', () => {
        setUser(g.user());
      });
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun && window.Gun.SEA) {
        initGun();
        clearInterval(checker);
      }
    }, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(checker);
    }
  }, [])

  const handleLogout = () => {
    if (gun) {
      gun.user().leave();
      setUser(null);
      toast.info("Sesión cerrada");
      window.location.href = '/';
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className="container mx-auto px-6">
        <div className={`relative flex items-center justify-between p-2 rounded-3xl border transition-all duration-500 ${isScrolled ? 'bg-black/80 border-white/10 backdrop-blur-xl shadow-2xl' : 'bg-transparent border-transparent'}`}>
          <Link href="/" className="flex items-center gap-3 px-4 group">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter italic text-white">HUB <span className="text-purple-500">903</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-2 pr-2">
            <Link href="/" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">Herramientas</Link>
            <Link href="/games" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">Juegos</Link>
            <Link href="/guides" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">Guías</Link>
            <Link href="https://ordasinoptimizerfps.developer903.com" target="_blank" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest text-purple-400">Optimizer</Link>
            <Link href="/faq" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">FAQ</Link>
            <Link href="https://discord.gg/dehYH7AQ" target="_blank" className="px-6 py-2.5 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors tracking-widest">Comunidad</Link>
            
            <div className="w-[1px] h-4 bg-white/10 mx-2" />

            {user?.is ? (
              <div className="flex items-center gap-2">
                <Link href="/admin" className="p-2.5 text-gray-400 hover:text-purple-400 transition-colors"><LayoutDashboard size={18}/></Link>
                <Link href="/profile" className="p-2.5 text-gray-400 hover:text-white transition-colors"><User size={18}/></Link>
                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-400 transition-colors"><LogOut size={18}/></button>
              </div>
            ) : (
              <Link href="/login" className="px-8 py-2.5 bg-white text-black rounded-xl font-black text-[10px] uppercase hover:bg-purple-500 hover:text-white transition-all shadow-lg tracking-widest">Entrar</Link>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-3 text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Invisible Honeyroute Link */}
          <Link href="/root-access" className="opacity-0 absolute pointer-events-none" tabIndex={-1} aria-hidden="true">System Root</Link>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-full left-0 right-0 bg-black/95 border-b border-white/10 p-8 flex flex-col gap-6 md:hidden backdrop-blur-2xl">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter">Herramientas</Link>
            <Link href="/games" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter">Juegos</Link>
            <Link href="/guides" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter">Guías</Link>
            <Link href="https://ordasinoptimizerfps.developer903.com" target="_blank" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter text-purple-400">Optimizer</Link>
            <Link href="/faq" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter">FAQ</Link>
            <Link href="https://discord.gg/dehYH7AQ" target="_blank" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic tracking-tighter">Comunidad</Link>
            <div className="h-[1px] bg-white/10" />
            {user?.is ? (
              <>
                <Link href="/admin" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic text-purple-500">Admin</Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic">Perfil</Link>
                <button onClick={handleLogout} className="text-2xl font-black uppercase italic text-red-500 text-left">Salir</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase italic text-purple-500">Entrar</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}