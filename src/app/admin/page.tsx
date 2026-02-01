'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Megaphone, Trash2, Terminal, Activity, Users, Ban, XCircle, AlertCircle, Eye } from 'lucide-react'
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
  const [threats, setThreats] = useState<any[]>([])
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

      // Proyectos
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });

      // Baneos
      g.get('ban_list').map().on((val: any, key: string) => {
        if (val) setBanList(prev => [...new Set([...prev, key])]);
        else setBanList(prev => prev.filter(k => k !== key));
      });

      // INTRUSIONES (Honeypot Logs)
      g.get('intrusion_logs').map().on((data: any, id: string) => {
        if (data) setThreats(prev => [...prev.filter(t => t.id !== id), { ...data, id }].sort((a,b) => b.time - a.time).slice(0, 5));
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
      toast.success('Anuncio enviado');
      setAnnouncement('');
    }
  }

  const addProjectP2P = () => {
    if (gun && newProject.title) {
      const cleanProject = { title: DOMPurify.sanitize(newProject.title), desc: DOMPurify.sanitize(newProject.desc), version: DOMPurify.sanitize(newProject.version), url: DOMPurify.sanitize(newProject.url) };
      gun.get('p2p_projects').set(cleanProject);
      toast.success('Proyecto publicado');
      setNewProject({ title: '', desc: '', version: '', url: '' });
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-10 rounded-[3rem] bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-500/20 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center"><Shield size={32} /></div>
                    <div><h1 className="text-3xl font-black tracking-tighter">ORDASIN COMMAND</h1><p className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Authorized Node Only</p></div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase">Nodos Online</p>
                    <p className="text-3xl font-black text-green-400">{onlineCount}</p>
                </div>
            </div>
            
            {/* PANEL DE THREATS (HoneyPot) */}
            <div className="p-8 rounded-[3rem] bg-black border border-red-900/30 backdrop-blur-xl">
                <h3 className="text-red-500 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14}/> Amenazas Detectadas</h3>
                <div className="space-y-3">
                    {threats.length === 0 && <p className="text-gray-600 text-[10px] font-bold italic">No se han detectado intrusiones...</p>}
                    {threats.map((t) => (
                        <div key={t.id} className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[9px] font-mono">
                            <p className="text-red-400 font-bold">[{new Date(t.time).toLocaleTimeString()}] INTRUSION_LOG</p>
                            <p className="text-gray-500 truncate">{t.userAgent}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
              <h2 className="text-xl font-black flex items-center gap-3 text-red-400"><Ban size={20} /> BLACKLIST</h2>
              <div className="flex gap-2"><input placeholder="ID..." id="banInput" className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /><button onClick={() => {
                const id = (document.getElementById('banInput') as HTMLInputElement).value;
                if(id) gun.get('ban_list').get(id).put(true);
              }} className="p-3 bg-red-600 rounded-xl"><Ban size={16} /></button></div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {banList.map(user => (<div key={user} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-[10px] font-mono">{user} <button onClick={() => gun.get('ban_list').get(user).put(null)} className="text-red-400"><XCircle size={14}/></button></div>))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-xl font-black flex items-center gap-3 text-blue-400"><Plus size={20} /> GESTIÓN P2P</h2>
            <div className="grid grid-cols-2 gap-4"><input placeholder="Título" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /><input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none" /></div>
            <button onClick={addProjectP2P} className="w-full py-4 bg-blue-600 rounded-2xl font-black">PUBLICAR</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {p2pProjects.map(p => (<div key={p.id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center"><div><p className="font-bold text-sm">{p.title}</p></div><button onClick={() => gun.get('p2p_projects').get(p.id).put(null)} className="text-gray-600 hover:text-red-400"><Trash2 size={18}/></button></div>))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
