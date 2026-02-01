'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Save, Terminal, Activity, Users, Ban, XCircle } from 'lucide-center'
import { motion } from 'framer-motion'

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

      // Verificación Criptográfica por LLAVE PÚBLICA
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      // ... resto de la lógica (proyectos, baneos, etc) ...
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

  // ... (funciones broadcastMessage, addProjectP2P, deleteProject, handleBan igual que antes) ...
  const broadcastMessage = () => {
    if (gun && announcement) {
      gun.get('hub_announcements').put({ text: announcement, time: Date.now() });
      alert('Anuncio enviado');
      setAnnouncement('');
    }
  }

  const addProjectP2P = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set(newProject);
      setNewProject({ title: '', desc: '', version: '', url: '' });
    }
  }

  const deleteProject = (id: string) => {
    if (gun) gun.get('p2p_projects').get(id).put(null);
  }

  const handleBan = () => {
    if (gun && targetBan) {
      gun.get('ban_list').get(targetBan).put(true);
      alert(`Usuario ${targetBan} baneado.`);
      setTargetBan('');
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      {/* (El resto del JSX del panel de admin que ya teníamos) */}
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/20 backdrop-blur-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              <Shield size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">CENTRO DE MANDO</h1>
              <p className="text-red-400 font-bold text-xs uppercase tracking-[0.3em]">Master Admin Console</p>
            </div>
          </div>
          <div className="flex gap-12">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nodos Activos</p>
              <p className="text-3xl font-black text-green-400 flex items-center gap-3 justify-end">
                {onlineCount} <Users size={24}/>
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* ... Resto de componentes del panel ... */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                    <Megaphone className="text-purple-400" /> ANUNCIOS
                </h2>
                <textarea 
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none"
                    placeholder="Escribe un mensaje global..."
                />
                <button onClick={broadcastMessage} className="w-full py-4 bg-purple-600 rounded-2xl font-black transition-all">ENVIAR DIFUSIÓN</button>
            </div>
            
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                    <Plus className="text-blue-400" /> NUEVO PROYECTO
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Título" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" />
                </div>
                <button onClick={addProjectP2P} className="w-full py-4 bg-blue-600 rounded-2xl font-black">PUBLICAR</button>
            </div>
        </div>
      </div>
    </main>
  )
}
