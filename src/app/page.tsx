'use client'

import { useState, useEffect } from "react"
import { projects as staticProjects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Sparkles, Search, Megaphone } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import DOMPurify from 'dompurify'

const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function Home() {
  const [search, setSearch] = useState("")
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [feed, setFeed] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      const gun = Gun({ peers: PEERS });

      // Proyectos dinámicos
      gun.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) {
          const cleanData = {
            title: DOMPurify.sanitize(data.title || ""),
            description: DOMPurify.sanitize(data.desc || data.description || ""),
            version: DOMPurify.sanitize(data.version || ""),
            url: DOMPurify.sanitize(data.url || "")
          };
          setP2pProjects(prev => {
            const filtered = prev.filter(p => p.id !== id);
            return [...filtered, { ...cleanData, id, isP2P: true }];
          });
        } else {
          setP2pProjects(prev => prev.filter(p => p.id !== id));
        }
      });

      // Muro Social P2P
      gun.get('global_social_feed').map().on((data: any, id: string) => {
        if (data && data.text) {
          const post = {
            id,
            text: DOMPurify.sanitize(data.text),
            author: DOMPurify.sanitize(data.author || "Anon"),
            time: data.time
          };
          setFeed(prev => [...prev.filter(p => p.id !== id), post].sort((a, b) => b.time - a.time).slice(0, 10));
        }
      });

      // Anuncios
      gun.get('hub_announcements').on((data: any) => {
        if (data && data.text) setAnnouncement(DOMPurify.sanitize(data.text));
      });
    };

    if (typeof window !== 'undefined') initGun();
  }, [])

  const allProjects = [...staticProjects, ...p2pProjects];
  const filteredProjects = allProjects.filter(p => 
    (p.title?.toLowerCase().includes(search.toLowerCase())) ||
    (p.description?.toLowerCase().includes(search.toLowerCase())) ||
    (p.desc?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-32">
        <AnimatePresence>
          {announcement && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-12">
              <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
                <Megaphone size={16} className="text-purple-400" />
                <p className="text-xs font-bold text-purple-200 flex-1">{announcement}</p>
                <button onClick={() => setAnnouncement("")} className="text-[10px] font-black text-purple-400 uppercase">Cerrar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            <section className="space-y-8">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">
                Software <span className="text-purple-500 italic">Hub</span>
              </h1>
              <div className="relative max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar herramientas..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={project.isP2P ? "#" : `/projects/${project.slug}`}>
                  <ProjectCard {...project} />
                </Link>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6 sticky top-32">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400" />
                FEED P2P
              </h2>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {feed.map((post) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={post.id} className="space-y-2 group">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-[10px] text-purple-400 font-bold uppercase">
                        {post.author[0]}
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-400">{post.author}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/5 group-hover:border-purple-500/30 transition-colors">
                      <p className="text-xs text-gray-300 leading-relaxed">{post.text}</p>
                    </div>
                  </motion.div>
                ))}
                {feed.length === 0 && <p className="text-[10px] text-gray-600 italic">No hay actividad reciente...</p>}
              </div>
              <Link href="/community" className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                Comunidad
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
