'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, ShieldAlert } from 'lucide-react'

export default function RootAccessTrap() {
  useEffect(() => {
    // La alerta se dispara automáticamente por el layout.tsx al detectar 'root' en la URL
    // Pero añadimos un delay y redirección para frustrar al atacante
    setTimeout(() => {
      window.location.href = '/trap';
    }, 3000);
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center font-mono text-red-500">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="p-12 border-2 border-red-900 rounded-[3rem] bg-red-950/10 text-center space-y-6"
      >
        <Lock size={60} className="mx-auto animate-bounce" />
        <h1 className="text-2xl font-black uppercase tracking-tighter">Acceso Restringido: ROOT_LEVEL</h1>
        <p className="text-xs text-gray-500 uppercase font-bold">Iniciando protocolo de seguridad del kernel...</p>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping [animation-delay:0.4s]" />
        </div>
      </motion.div>
    </main>
  )
}
