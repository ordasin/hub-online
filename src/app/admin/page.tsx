'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Activity, Users, Ban, XCircle, AlertTriangle, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [newProject, setNewProject] = useState({ title: '', desc: '', version: '', url: '' })

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun'],
        localStorage: false
      });
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("Consola Maestra Conectada");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // 1. Cargar Proyectos P2P
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) {
          setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        } else {
          setP2pProjects(prev => prev.filter(p => p.id !== id));
        }
      });

      // 2. Cargar Amenazas
      g.get('intrusion_logs').map().on((data: any) => {
        if (data && data.id) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== data.id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 10);
          });
        }
      });
    };

    if (typeof window !== 'undefined') initAdmin();
  }, [])

  const broadcastMessage = () => {
    if (gun && announcement) {
      const cleanAnnouncement = DOMPurify.sanitize(announcement);
      gun.get('hub_announcements').put({ text: cleanAnnouncement, time: Date.now() });
      toast.success('Anuncio global enviado');
      setAnnouncement('');
    }
  }

  const addProjectP2P = () => {
    if (gun && newProject.title) {
      const cleanProject = {
        title: DOMPurify.sanitize(newProject.title),
        desc: DOMPurify.sanitize(newProject.desc),
        version: DOMPurify.sanitize(newProject.version),
        url: DOMPurify.sanitize(newProject.url)
      };
      gun.get('p2p_projects').set(cleanProject);
      toast.success('Proyecto publicado en el Hub');
      setNewProject({ title: '', desc: '', version: '', url: '' });
    }
  }

  const deleteProject = (id: string) => {
    if (gun) {
      gun.get('p2p_projects').get(id).put(null);
      toast.info('Proyecto eliminado');
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 backdrop-blur-xl flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Shield size={48} className="text-purple-500" />
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Panel de Gestión</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Control Total P2P</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* GESTIÓN DE PROYECTOS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-blue-400">
                    <Plus size={20} /> Añadir Nueva Herramienta
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Nombre del Software" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" />
                    <input placeholder="Versión (ej: 1.0.0)" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" />
                </div>
                <textarea placeholder="Descripción detallada..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none resize-none" />
                <button onClick={addProjectP2P} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black transition-all">PUBLICAR PROYECTO</button>
            </div>

            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400">
                    <Package size={20} /> Catálogo Dinámico
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pProjects.length === 0 && <p className="text-gray-600 italic text-sm p-4 text-center col-span-2">No hay proyectos dinámicos publicados.</p>}
                    {p2pProjects.map((p) => (
                        <div key={p.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group">
                            <div>
                                <p className="font-bold text-white">{p.title}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black">v{p.version}</p>
                            </div>
                            <button onClick={() => deleteProject(p.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* MONITOR DE AMENAZAS Y ANUNCIOS */}
          <aside className="space-y-8">
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400">
                    <Activity size={18} /> Amenazas
                </h2>
                <div className="space-y-3">
                    {threats.map((t) => (
                        <div key={t.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[9px] font-mono">
                            <p className="text-red-400 font-bold">{t.type}</p>
                            <p className="text-gray-600 truncate">{t.path}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-yellow-400">
                    <Megaphone size={18} /> Difusión
                </h2>
                <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none" placeholder="Mensaje global..." />
                <button onClick={broadcastMessage} className="w-full py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-yellow-400 transition-all">ENVIAR</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}