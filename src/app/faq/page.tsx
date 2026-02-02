'use client'

import { motion } from 'framer-motion'
import { HelpCircle, ShieldCheck, Globe, Lock } from 'lucide-react'

const faqs = [
  {
    q: "¿Es seguro el software de HUB 903?",
    a: "Absolutamente. Todas las herramientas pasan por un riguroso análisis de seguridad y son firmadas criptográficamente. Al ser un ecosistema P2P, la integridad del código es verificada por múltiples nodos."
  },
  {
    q: "¿Cómo funciona la red descentralizada?",
    a: "Utilizamos el protocolo Gun.js. Esto significa que los datos (anuncios, feeds, perfiles) fluyen directamente entre los navegadores de los usuarios sin pasar por un servidor central, garantizando privacidad y resistencia a la censura."
  },
  {
    q: "¿Necesito una cuenta para descargar?",
    a: "No es obligatorio para las herramientas básicas, pero crear una identidad P2P te permite acceder al Laboratorio, participar en los debates de juegos y tener un rango dentro de la comunidad."
  },
  {
    q: "¿OrdasinOptimizer funciona en cualquier Windows?",
    a: "Está optimizado para Windows 10 y 11. Realiza ajustes a nivel de sistema para eliminar telemetría innecesaria y liberar recursos consumidos por procesos en segundo plano."
  }
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Preguntas <span className="text-purple-500">Frecuentes</span></h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em]">Centro de Soporte y Claridad Técnica</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <h3 className="text-lg font-black uppercase flex items-center gap-4 mb-4 italic group-hover:text-purple-400 transition-colors">
                <HelpCircle size={20} className="text-purple-500" /> {faq.q}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-bold">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 text-center space-y-2">
            <ShieldCheck className="mx-auto text-green-500" size={32} />
            <p className="text-[10px] font-black uppercase">Seguridad SSL</p>
          </div>
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center space-y-2">
            <Lock className="mx-auto text-blue-500" size={32} />
            <p className="text-[10px] font-black uppercase">AES-256 Cifrado</p>
          </div>
          <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/10 text-center space-y-2">
            <Globe className="mx-auto text-purple-500" size={32} />
            <p className="text-[10px] font-black uppercase">Red P2P Activa</p>
          </div>
        </div>

      </div>
    </main>
  )
}
