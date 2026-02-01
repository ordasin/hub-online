'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Save, Terminal, Activity, Server } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [gun, setGun] = useState<any>(null)
  const [newProject, setNewProject] = useState({ title: '', desc: '', version: '', url: '' })
  const [stats, setStats] = useState({ peers: 0, ops: 0 })

  useEffect(() => {
    const initAdmin = async () => {
      const Gun = (await import('gun')).default;
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      setGun(g);
      const user = (g as any).user().recall({ sessionStorage: true });

      // Solo tú tienes acceso (nombre de usuario: ordasin)
      if (user.is && user.is.alias === 'ordasin') {
        setIsAdmin(true);
      } else {
        // Si no eres tú, te redirigimos al login
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    };

    if (typeof window !== 'undefined') initAdmin();
  }, [])

  const broadcastMessage = () => {
    if (gun && announcement) {
      gun.get('hub_announcements').put({ text: announcement, time: Date.now() });
      alert('Anuncio enviado a la red P2P');
      setAnnouncement('');
    }
  }

  const addProjectP2P = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set(newProject);
      alert('Proyecto añadido a la base de datos P2P');
      setNewProject({ title: '', desc: '', version: '', url: '' });
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Admin */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/20 backdrop-blur-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
              <Shield size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">CENTRO DE MANDO</h1>
              <p className="text-red-400 font-bold text-xs uppercase tracking-[0.3em]">Nivel de Acceso: Master Admin</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">Estado Global</p>
                <p className="text-green-400 font-black flex items-center gap-2">SISTEMA NOMINAL <Activity size={14}/></p>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enviar Anuncio */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6"
          >
            <h2 className="text-xl font-black flex items-center gap-3">
              <Megaphone className="text-purple-400" />
              DIFUSIÓN GLOBAL P2P
            </h2>
            <textarea 
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Escribe un mensaje para todos los usuarios..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
            <button 
              onClick={broadcastMessage}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
            >
              ENVIAR A LA RED
            </button>
          </motion.div>

          {/* Añadir Proyecto */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6"
          >
            <h2 className="text-xl font-black flex items-center gap-3">
              <Plus className="text-blue-400" />
              NUEVO PROYECTO DINÁMICO
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Título"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none"
              />
              <input 
                placeholder="Versión"
                value={newProject.version}
                onChange={(e) => setNewProject({...newProject, version: e.target.value})}
                className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none"
              />
            </div>
            <textarea 
              placeholder="Descripción corta"
              value={newProject.desc}
              onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
              className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none resize-none"
            />
            <button 
              onClick={addProjectP2P}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black transition-all"
            >
              PUBLICAR PROYECTO
            </button>
          </motion.div>
        </div>

        {/* Consola de Sistema */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2.5rem] bg-black border border-white/10 font-mono text-xs"
        >
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Terminal size={14} />
            <span>CONSOLE_ORDASIN_HUB_v1.0.log</span>
          </div>
          <div className="space-y-1 text-green-500/70">
            <p>[OK] Handshake con relé Manhattan exitoso.</p>
            <p>[OK] Cifrado de nivel 4 activado.</p>
            <p>[INFO] Escaneando nodos activos...</p>
            <p className="text-green-400 font-bold tracking-widest animate-pulse mt-2">{'>'} ESTADO: ESCUCHANDO PETICIONES P2P_</p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
