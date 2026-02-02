'use client'

import { motion } from 'framer-motion'
import { BookOpen, Terminal, Download, Monitor, Shield, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const guides = [
  {
    title: "Primeros pasos con OrdasinOptimizer",
    desc: "Aprende a limpiar tu PC y optimizar el rendimiento de Windows sin comprometer la seguridad.",
    icon: Zap,
    color: "text-blue-400",
    slug: "guia-optimizer"
  },
  {
    title: "CyberGodfather: Framework Linux",
    desc: "Guía técnica para instalar y ejecutar el framework de ciberseguridad en Kali Linux o Ubuntu.",
    icon: Terminal,
    color: "text-purple-400",
    slug: "guia-cybergodfather"
  },
  {
    title: "Entendiendo la Red P2P",
    desc: "Cómo tu navegador se convierte en un nodo y por qué tus datos están más seguros que nunca.",
    icon: Shield,
    color: "text-green-400",
    slug: "guia-p2p"
  }
]

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-16">
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Guías de <span className="text-purple-500">Uso</span></h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em]">Documentación y Entrenamiento para el HUB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="space-y-6">
                <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center ${guide.color}`}>
                  <guide.icon size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">{guide.title}</h3>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">{guide.desc}</p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Leer Manual <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        <section className="p-12 rounded-[4rem] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <h2 className="text-3xl font-black uppercase italic tracking-tight relative z-10">¿Eres Desarrollador?</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm font-bold relative z-10">Accede a nuestra API descentralizada y contribuye al crecimiento del HUB 903 subiendo tus propios módulos en español.</p>
          <div className="relative z-10 pt-4">
            <button className="px-10 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase hover:bg-purple-500 hover:text-white transition-all shadow-2xl">Unirse al Laboratorio</button>
          </div>
        </section>

      </div>
    </main>
  )
}
