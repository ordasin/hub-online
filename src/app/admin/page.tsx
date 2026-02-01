'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Users, AlertTriangle, Trash2, Home, Plus, Megaphone, Send, Package, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [socialPost, setSocialPost] = useState('')
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: PEERS });
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("CENTRO DE MANDO CONECTADO");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // 1. Escuchar Amenazas
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => [data, ...prev.filter(t => t.id !== data.id)].sort((a,b) => b.time - a.time).slice(0, 10));
        }
      });

      // 2. Escuchar Proyectos
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });

      // 3. Notificación inmediata
      g.get('latest_threat').on((data: any) => {
        // Aumentamos el margen a 30 segundos por si hay lag en la red P2P
        if (data && data.time > Date.now() - 30000) {
          toast.error(`!!! AMENAZA DETECTADA !!!`, { 
            description: `${data.type} en ${data.path}`,
            duration: 10000
          });
        }
      });
    };
    init();
  }, [])

  const publishProject = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set({ ...newProject, title: DOMPurify.sanitize(newProject.title), time: Date.now() });
      setNewProject({ title: '', version: '', desc: '' });
      toast.success("Proyecto publicado");
    }
  }

  const sendAnnouncement = () => {
    if (gun && announcement) {
      gun.get('hub_announcements').put({ text: DOMPurify.sanitize(announcement), time: Date.now() });
      setAnnouncement('');
      toast.success("Anuncio global emitido");
    }
  }

  const postToFeed = () => {
    if (gun && socialPost) {
      const id = Math.random().toString(36).substring(7);
      gun.get('global_social_feed').get(id).put({
        text: DOMPurify.sanitize(socialPost),
        author: 'Master Admin',
        time: Date.now()
      });
      setSocialPost('');
      toast.success("Post publicado en el muro");
    }
  }

  const simulateThreat = () => {
    if (gun) {
      const id = Math.random().toString(36).substring(7);
      const log = { id, type: 'MANUAL_TEST', path: '/admin', time: Date.now(), userAgent: 'Admin Simulation' };
      gun.get('intrusion_logs').get(id).put(log);
      gun.get('latest_threat').put(log);
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-red-900/20 via-black to-purple-900/20 border border-white/10 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">OR-COMMAND v1.0</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.3em]">ESTADO: MONITORIZANDO RED P2P</p>
            </div>
          </div>
          <button onClick={simulateThreat} className="px-6 py-2 bg-white text-black text-[10px] font-black rounded-full hover:bg-red-600 hover:text-white transition-all">SIMULAR ALERTA</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: SEGURIDAD Y FEED */}
          <div className="space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400"><Activity size={18}/> Intrusiones</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-3 bg-red-900/10 border border-red-900/20 rounded-xl text-[9px]">
                            <p className="font-black text-red-500">{t.type} @ {new Date(t.time).toLocaleTimeString()}</p>
                            <p className="text-gray-500 truncate">{t.path}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-blue-400"><Send size={18}/> Muro Social</h2>
                <textarea value={socialPost} onChange={(e) => setSocialPost(e.target.value)} className="w-full h-24 bg-black border border-white/10 rounded-xl p-3 text-xs outline-none" placeholder="¿Qué hay de nuevo?" />
                <button onClick={postToFeed} className="w-full py-3 bg-blue-600 rounded-xl font-black text-[10px]">POSTEAR EN FEED</button>
            </section>
          </div>

          {/* COLUMNA CENTRAL: GESTIÓN DE CATÁLOGO */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400"><Package size={20}/> Nuevo Proyecto</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nombre" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                </div>
                <textarea placeholder="Descripción..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                <button onClick={publishProject} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 shadow-lg shadow-purple-900/20">PUBLICAR EN EL HUB</button>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-gray-400"><Terminal size={20}/> Catálogo P2P Activo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pProjects.map(p => (
                        <div key={p.id} className="p-4 bg-black border border-white/5 rounded-2xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                            <div><p className="font-bold text-sm text-white">{p.title}</p><p className="text-[10px] text-gray-600">v{p.version}</p></div>
                            <button onClick={() => gun.get('p2p_projects').get(p.id).put(null)} className="p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </section>
          </div>

        </div>

        {/* ANUNCIOS GLOBALES */}
        <section className="p-8 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/20 flex gap-6 items-center">
            <div className="bg-yellow-500 p-4 rounded-2xl text-black"><Megaphone size={24}/></div>
            <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="flex-1 bg-transparent border-b border-yellow-500/20 p-2 outline-none text-sm font-bold text-yellow-200" placeholder="Escribir anuncio global prioritario..." />
            <button onClick={sendAnnouncement} className="px-8 py-3 bg-yellow-500 text-black font-black rounded-xl text-xs hover:bg-yellow-400 transition-all">EMITIR</button>
        </section>

        <div className="text-center pt-10"><button onClick={() => window.location.href='/'} className="inline-flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-all"><Home size={12}/> Volver al Hub Principal</button></div>
      </div>
    </main>
  )
}
