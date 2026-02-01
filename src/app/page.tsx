'use client'

import { useState } from "react"
import { projects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Sparkles, Search, Code, Cpu, Globe, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  const [search, setSearch] = useState("")

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Fondo con efectos de gradiente */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        {/* Hero Section */}
        <section className="text-center mb-24 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-purple-100 uppercase tracking-widest">Ordasin Hub Online</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            HUB DE <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-500 to-blue-500 animate-gradient-x">
              SOFTWARE PRO
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Explora un ecosistema de aplicaciones, optimizadores y herramientas de vanguardia 
            desarrolladas por <span className="text-white font-medium">Ordasin</span>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative pt-10"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Busca optimizadores, juegos, scripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24 max-w-4xl mx-auto">
          {[
            { label: "Proyectos", value: projects.length, icon: Code },
            { label: "Uptime", value: "99.9%", icon: Cpu },
            { label: "Usuarios", value: "+1k", icon: Globe },
            { label: "Versión", value: "2026.1", icon: Sparkles },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
              <stat.icon size={20} className="mx-auto mb-2 text-purple-400 opacity-70" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-tighter">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link href={`/projects/${project.slug}`}>
                <div className="h-full transition-transform duration-300 group-hover:-translate-y-2">
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    version={project.version}
                    downloadCount={project.downloadCount}
                    fileUrl={project.fileUrl}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl">
            <div className="text-gray-500 text-xl font-light">
              No se encontraron herramientas con "{search}"
            </div>
            <button 
              onClick={() => setSearch("")}
              className="mt-4 text-purple-400 hover:underline flex items-center gap-2 mx-auto"
            >
              Ver todos los proyectos <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-48 border-t border-white/5 pt-12 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-left">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                Hub-Online
              </h2>
              <p className="text-gray-500 text-sm mt-2">Tecnología de alto impacto para usuarios exigentes.</p>
            </div>
            
            <div className="flex gap-8 text-sm text-gray-400">
              <Link href="/community" className="hover:text-white transition-colors">Comunidad</Link>
              <Link href="https://github.com/ordasin" className="hover:text-white transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-white transition-colors">Soporte</Link>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-600 uppercase tracking-[0.2em]">
            © 2026 Ordasin Developer • Designed for the Future
          </div>
        </footer>
      </div>
    </main>
  )
}
