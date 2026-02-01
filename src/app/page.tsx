import { projects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Sparkles, LayoutDashboard } from "lucide-react"
import Link from "next/link"

'use client'

import { useState } from "react"
import { projects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Sparkles, Search } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [search, setSearch] = useState("")

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Ordasin Hub v1.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="block text-white mb-2 text-glow">Proyectos de</span>
            <span className="text-gradient font-black">Alto Rendimiento</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explora mis aplicaciones, herramientas y juegos. Todo alojado de forma segura y directa.
          </p>

          <div className="max-w-md mx-auto relative pt-8">
            <Search className="absolute left-4 bottom-3.5 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Buscar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <ProjectCard
                title={project.title}
                description={project.description}
                version={project.version}
                downloadCount={project.downloadCount}
                fileUrl={project.fileUrl}
              />
            </Link>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No se encontraron proyectos que coincidan con "{search}"
          </div>
        )}

        <footer className="mt-32 border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>© 2026 Developer903. Hosteado con ❤️ en GitHub Pages.</p>
        </footer>
      </div>
    </main>
  )
}