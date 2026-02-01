'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Save, Terminal, Activity, Users, Ban, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [gun, setGun] = useState<any>(null)
  const [newProject, setNewProject] = useState({ title: '', desc: '', version: '', url: '' })
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [banList, setBanList] = useState<string[]>([])
  const [targetBan, setTargetBan] = useState('')
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("Consola Maestra de Admin activa");
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });

      g.get('ban_list').map().on((val: any, key: string) => {
        if (val) setBanList(prev => [...new Set([...prev, key])]);
        else setBanList(prev => prev.filter(k => k !== key));
      });

      const now = Date.now();
      g.get('online_users').map().on((time: number, id: string) => {
        if (now - time < 10000) setOnlineCount(prev => prev + 1);
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
      toast.success('Proyecto publicado en la red');
      setNewProject({ title: '', desc: '', version: '', url: '' });
    }
  }

  const deleteProject = (id: string) => {
    if (gun) {
        gun.get('p2p_projects').get(id).put(null);
        toast.info('Proyecto eliminado de la red');
    }
  }

  const handleBan = () => {
    if (gun && targetBan) {
      gun.get('ban_list').get(targetBan).put(true);
      toast.error(`Usuario ${targetBan} baneado`);
      setTargetBan('');
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3rem] bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/20 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]"><Shield size={40} /></div>
            <div><h1 className="text-4xl font-black tracking-tighter">CENTRO DE MANDO</h1><p className="text-red-400 font-bold text-xs uppercase tracking-[0.3em]">Master Admin Console</p></div>
          </div>
          <div className="flex gap-12 text-right">
            <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nodos Activos</p><p className="text-3xl font-black text-green-400 flex items-center gap-3 justify-end">{onlineCount} <Users size={24}/></p></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
              <h2 className="text-xl font-black flex items-center gap-3 text-red-400"><Ban size={20} /> CONTROL DE ACCESO</h2>
              <div className="flex gap-2"><input placeholder="ID a banear..." value={targetBan} onChange={(e) => setTargetBan(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /><button onClick={handleBan} className="p-3 bg-red-600 rounded-xl"><Ban size={16} /></button></div>
              <div className="space-y-2 max-h-48 overflow-y-auto">{banList.map(user => (<div key={user} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-mono text-gray-400 truncate w-32">{user}</span><button onClick={() => gun.get('ban_list').get(user).put(null)} className="text-red-400 hover:text-white transition-colors"><XCircle size={14} /></button></div>))}</div>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
              <h2 className="text-xl font-black flex items-center gap-3"><Megaphone className="text-purple-400" /> ANUNCIOS</h2>
              <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none" placeholder="Mensaje global..." />
              <button onClick={broadcastMessage} className="w-full py-3 bg-purple-600 rounded-xl font-black">ENVIAR</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
              <h2 className="text-xl font-black flex items-center gap-3 text-blue-400"><Plus size={20} /> NUEVO PROYECTO</h2>
              <div className="grid grid-cols-2 gap-4"><input placeholder="Título" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /><input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /></div>
              <textarea placeholder="Descripción..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none" />
              <button onClick={addProjectP2P} className="w-full py-3 bg-blue-600 rounded-xl font-black">PUBLICAR</button>
              <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {p2pProjects.map(p => (<div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group"><div><p className="font-bold text-sm">{p.title}</p><p className="text-[10px] text-gray-500">v{p.version}</p></div><button onClick={() => deleteProject(p.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={18} /></button></div>))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}