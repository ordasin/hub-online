'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  useEffect(() => {
    const logScan = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun(['https://relay.gun.eco/gun']);
      gun.get('HUB_HISTORY').set({
        type: '404_SCAN',
        path: window.location.pathname,
        time: Date.now()
      });
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        logScan();
        clearInterval(checker);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-mono">
      <div className="text-center space-y-8">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 bg-red-900/20 border border-red-900/30 rounded-[2rem] flex items-center justify-center mx-auto text-red-500">
          <AlertCircle size={48} />
        </motion.div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter">404</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Error: Ruta no detectada</p>
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-600 hover:text-white transition-all">
          <ArrowLeft size={18} /> VOLVER AL HUB
        </Link>
      </div>
    </main>
  )
}