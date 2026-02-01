'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  useEffect(() => {
    const logScan = async () => {
      const Gun = (await import('gun')).default;
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      
      // Registrar que alguien buscó una página inexistente (Escaneo de vulnerabilidades)
      gun.get('intrusion_logs').set({
        type: 'PATH_SCAN',
        details: `Intento de acceso a ruta inexistente: ${window.location.pathname}`,
        userAgent: navigator.userAgent,
        time: Date.now()
      });
    };

    if (typeof window !== 'undefined') logScan();
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto text-purple-500"
        >
          <AlertCircle size={48} />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter">404</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Contenido No Encontrado</p>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed">
          La ruta solicitada no existe en el Ordasin Hub. Tu intento ha sido registrado por seguridad.
        </p>

        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all">
          <ArrowLeft size={18} />
          VOLVER AL HUB
        </Link>
      </div>
    </main>
  )
}
