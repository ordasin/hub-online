'use client'

import { Feedback } from "@/components/Feedback"
import { Users, MessageSquare, Shield, Sparkles, Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function CommunityContent() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Fondo con efectos de gradiente */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
              <Users size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-blue-100 uppercase tracking-widest">Feedback & Ideas</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              COMUNIDAD <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
                HUB ONLINE
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
              Un espacio exclusivo para usuarios y entusiastas. Comparte tus ideas, reporta fallos 
              o simplemente forma parte del futuro de nuestras herramientas.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24"
          >
            {[
              { 
                title: "Libertad", 
                desc: "Opina libremente sobre mis herramientas y proyectos.", 
                icon: MessageSquare,
                color: "text-purple-400",
                bg: "bg-purple-500/10"
              },
              { 
                title: "Conexión", 
                desc: "Conoce a otros usuarios que utilizan el mismo ecosistema.", 
                icon: Heart,
                color: "text-pink-400",
                bg: "bg-pink-500/10"
              },
              { 
                title: "Directo", 
                desc: "Feedback directo sin intermediarios para mejorar rápido.", 
                icon: Shield,
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <MessageSquare className="text-purple-400" />
                Deja tu Feedback
              </h2>
              <Feedback />
            </div>
          </motion.div>

          <footer className="mt-32 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-widest">
              Gracias por ser parte de Hub-Online
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}
