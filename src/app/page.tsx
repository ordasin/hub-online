'use client'

import { useState, useEffect } from "react"
import { projects as staticProjects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Sparkles, Search, Code, Cpu, Globe, ArrowRight, Megaphone } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [search, setSearch] = useState("")
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);

      // Cargar proyectos dinámicos
      gun.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) {
          setP2pProjects(prev => {
            const filtered = prev.filter(p => p.id !== id);
            return [...filtered, { ...data, id, isP2P: true }];
          });
        }
      });

      // Escuchar anuncios del Admin
      gun.get('hub_announcements').on((data: any) => {
        if (data && data.text) setAnnouncement(data.text);
      });
    };

    if (typeof window !== 'undefined') initGun();
  }, [])

  const allProjects = [...staticProjects, ...p2pProjects];
  const filteredProjects = allProjects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        {/* Banner de Anuncio */}
        <AnimatePresence>
          {announcement && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                <div className="bg-purple-500 p-2 rounded-lg animate-bounce">
                  <Megaphone size={16} className="text-white" />
                </div>
                <p className="text-sm font-bold text-purple-100 flex-1">{announcement}</p>
                <button onClick={() => setAnnouncement("")} className="text-purple-400 hover:text-white text-xs font-black">CERRAR</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link href={project.isP2P ? "#" : `/projects/${project.slug}`}>
                <div className="h-full transition-transform duration-300 group-hover:-translate-y-2">
                  <ProjectCard
                    title={project.title}
                    description={project.description || project.desc}
                    version={project.version}
                    downloadCount={project.downloadCount || 0}
                    fileUrl={project.fileUrl || project.url}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* ... footer ... */}
      </div>
    </main>
  )
}