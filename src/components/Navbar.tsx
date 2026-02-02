'use client'

import Link from "next/link"
import { Github, LayoutGrid, MessageCircle, Zap, Users } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-6 font-mono">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-5xl mx-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-full px-8 py-4 flex justify-between items-center shadow-2xl"
      >
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">O</div>
          <span className="font-black text-white uppercase hidden sm:block tracking-widest">Ordasin Hub</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
            <LayoutGrid size={16} /> <span>Proyectos</span>
          </Link>
          <Link href="/chat" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
            <Zap size={16} className="text-yellow-500" /> <span>Chat P2P</span>
          </Link>
          <Link href="/community" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
            <Users size={16} /> <span>Comunidad</span>
          </Link>
          
          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-4">
            <Link href="https://discord.gg/dehYH7AQ" target="_blank" className="text-gray-400 hover:text-[#5865F2] transition-colors"><MessageCircle size={20} /></Link>
            <Link href="https://github.com/ordasin" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Github size={20} /></Link>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}
