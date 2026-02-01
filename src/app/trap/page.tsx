'use client'

import { useEffect } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  useEffect(() => {
    const logIntrusion = async () => {
      const Gun = (await import('gun')).default;
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      
      // Registrar la intrusión en la red P2P
      gun.get('intrusion_logs').set({
        type: 'ROBOT_SCAN',
        path: window.location.pathname,
        time: Date.now(),
        userAgent: navigator.userAgent
      });
    };

    if (typeof window !== 'undefined') logIntrusion();
  }, [])

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/10 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        <ShieldAlert size={80} className="mx-auto animate-pulse" />
        <h1 className="text-3xl font-black tracking-tighter uppercase">Intrusion Detected</h1>
        <div className="bg-red-600 text-black px-4 py-1 font-bold text-xs inline-block">SYSTEM_TRAP_ACTIVATED</div>
        <p className="text-red-400/70 text-sm leading-relaxed">
          Your connection has been flagged and logged in the P2P decentralized network. 
          Unauthorized access to administrative paths is strictly prohibited.
        </p>
        <div className="pt-8 text-[10px] text-red-900 font-bold uppercase tracking-[0.3em]">
          Trace ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </motion.div>
    </main>
  )
}
