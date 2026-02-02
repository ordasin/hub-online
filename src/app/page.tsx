'use client'

import { useState, useEffect } from "react"
import { projects as staticProjects } from "@/data/projects"
import { ProjectCard } from "@/components/ProjectCard"
import { Search, Megaphone } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { HeroScene } from "@/components/HeroScene"
import DOMPurify from 'dompurify'

export default function Home() {
  const [search, setSearch] = useState("")
  const [p2pProjects, setP2pProjects] = useState<Record<string, unknown>[]>([])
  const [feed, setFeed] = useState<Record<string, unknown>[]>([])
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const initGun = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun([
        'wss://gun.v6.rocks/gun',
        'https://peer.wall.org/gun',
        'https://relay.gun.eco/gun'
      ]);

      gun.get('p2p_projects').map().on((data: { title: string, desc: string, description: string, version: string }, id: string) => {
        if (data) {
          const cleanData = { title: DOMPurify.sanitize(data.title || ""), description: DOMPurify.sanitize(data.desc || data.description || ""), version: DOMPurify.sanitize(data.version || "") };
          setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...cleanData, id, isP2P: true }]);
        }
      });

      gun.get('global_social_feed').map().on((data: { text: string, author: string, time: number }, id: string) => {
        if (data && data.text) {
          setFeed(prev => [...prev.filter(p => p.id !== id), { id, text: DOMPurify.sanitize(data.text), author: DOMPurify.sanitize(data.author || "Anon"), time: data.time }].sort((a,b) => b.time - a.time).slice(0, 5));
        }
      });

      gun.get('hub_announcements').on((data: { text: string }) => {
        if (data && data.text) setAnnouncement(DOMPurify.sanitize(data.text));
      });
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun) { initGun(); clearInterval(checker); }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  const filteredProjects = [...staticProjects, ...p2pProjects].filter(p => (p.title?.toLowerCase().includes(search.toLowerCase())) || (p.description?.toLowerCase().includes(search.toLowerCase())));

  const handleSearchChange = (val: string) => {
    setSearch(val);
    
    // Motor de detección avanzado (WAF)
    const attackPatterns = [
      /<script/i, /alert\(/i, /onerror=/i, /onload=/i, /eval\(/i, // XSS
      /' OR /i, /UNION SELECT/i, /--/i, /\/\*/i, // SQLi
      /\.\.\//i, /\/etc\/passwd/i, /;\s*rm /i, /\|\s*bash/i // Traversal & OS
    ];

    if (attackPatterns.some(pattern => pattern.test(val))) {
      console.log("⚠️ AMENAZA DETECTADA:", val);
      const id = 'WAF_' + Math.random().toString(36).substring(7);
      fetch('https://ntfy.sh/ordasin_security_v10', {
        method: 'POST',
        body: JSON.stringify({ 
          id, 
          type: 'WAF_BLOCK', 
          time: Date.now(), 
          details: `Payload bloqueado: "${val}"` 
        })
      }).catch(() => {});
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-x-hidden">
      <HeroScene />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-32">
        {/* Honeypot link for bots */}
        <Link 
          href="/trap" 
          onClick={() => {
            fetch('https://ntfy.sh/ordasin_security_v10', {
              method: 'POST',
              body: JSON.stringify({ 
                id: 'LINK_TRAP_'+Date.now(), 
                type: 'INVISIBLE_LINK_HIT', 
                time: Date.now(), 
                details: 'Bot detectado: Siguió el enlace invisible' 
              }),
              keepalive: true
            }).catch(() => {});
          }}
          className="opacity-0 absolute pointer-events-none" 
          tabIndex={-1} 
          aria-hidden="true"
        >
          Admin Login
        </Link>
        
        <AnimatePresence>
          {announcement && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-12">
              <div className="bg-purple-600/10 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4">
                <Megaphone size={16} className="text-purple-400" />
                <p className="text-xs font-bold text-purple-200 flex-1">{announcement}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">
                Ordasin <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Hub Online</span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative max-w-xl"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Buscar herramientas..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-purple-500/50 outline-none" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={project.isP2P ? "#" : `/projects/${project.slug}`}><ProjectCard {...project} /></Link>
              ))}
            </div>
          </div>
          <aside className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Feed P2P</h2>
              <div className="space-y-4">
                {feed.map((post) => (
                  <div key={post.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{post.author}</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
