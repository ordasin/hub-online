'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, AlertTriangle, Trash2, Home, Plus, Megaphone, Send, Package, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [socialPost, setSocialPost] = useState('')
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun({ peers: PEERS, localStorage: true });
      setGun(g);

      g.on('hi', () => setPeers(p => p + 1));
      g.on('bye', () => setPeers(p => Math.max(0, p - 1)));
      
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) {
        setIsAdmin(true);
        toast.success("CONSOLA MAESTRA CONECTADA");
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      // Escuchar Seguridad
      g.get('ORDASIN_SEC_V6').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) {
              toast.error("! AMENAZA DETECTADA !", { description: data.type });
            }
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });

      // Escuchar Proyectos
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, [])

  const publishProject = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set({ ...newProject, title: DOMPurify.sanitize(newProject.title), time: Date.now() });
      setNewProject({ title: '', version: '', desc: '' });
      toast.success("Herramienta publicada");
    }
  }

  const sendAnnouncement = () => {
    if (gun && announcement) {
      gun.get('hub_announcements').put({ text: DOMPurify.sanitize(announcement), time: Date.now() });
      setAnnouncement('');
      toast.success("Banner global actualizado");
    }
  }

  const postToFeed = () => {
    if (gun && socialPost) {
      const id = 'post' + Date.now();
      gun.get('global_social_feed').get(id).put({
        text: DOMPurify.sanitize(socialPost),
        author: 'Master Admin',
        time: Date.now()
      });
      setSocialPost('');
      toast.success("Post enviado al muro");
    }
  }

  const clearThreats = () => {
    if (gun) {
      gun.get('ORDASIN_SEC_V6').put(null);
      setThreats([]);
      toast.info("Logs purgados");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP STATUS */}
        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-red-900/20 via-black to-purple-900/20 border border-white/10 flex justify-between items-center backdrop-blur-xl relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest">Master Commander</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.3em] flex items-center gap-2">
                    <Wifi size={12} className={peers > 0 ? 'text-green-500 animate-pulse' : 'text-red-500'}/>
                    RED P2P: {peers > 0 ? `ACTIVA (${peers} NODOS)` : 'SINCRONIZANDO...'}
                </p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-500 hover:text-white transition-all">PANEL HUB</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECURITY & SOCIAL COLUMN */}
          <div className="space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400"><Activity size={18}/> Intrusiones</h2>
                    <button onClick={clearThreats} className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl text-[9px] group hover:bg-red-900/20 transition-all">
                            <div className="flex justify-between mb-1">
                                <p className="font-black text-red-500 uppercase">{t.type}</p>
                                <p className="text-gray-500">{new Date(t.time).toLocaleTimeString()}</p>
                            </div>
                            <p className="text-gray-400 truncate opacity-60">{t.ua || t.userAgent}</p>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-10 text-gray-700 text-[10px] font-black uppercase">Escaneando...</p>}
                </div>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-blue-400"><Send size={18}/> Social Update</h2>
                <textarea value={socialPost} onChange={(e) => setSocialPost(e.target.value)} className="w-full h-24 bg-black border border-white/10 rounded-2xl p-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="¿Novedades en el Hub?" />
                <button onClick={postToFeed} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-xs hover:bg-blue-500 transition-all">PUBLICAR EN FEED</button>
            </section>
          </div>

          {/* PROJECT MANAGEMENT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400"><Plus size={20}/> Publicar Software</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nombre del Proyecto" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500/50" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <textarea placeholder="Descripción del sistema..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black border border-white/10 rounded-xl p-4 text-xs outline-none resize-none focus:ring-2 focus:ring-purple-500/50" />
                <button onClick={publishProject} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 shadow-xl shadow-purple-900/20 transition-all">EMITIR HACIA LA RED</button>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-gray-400"><Package size={20}/> Software en Línea</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pProjects.map(p => (
                        <div key={p.id} className="p-5 bg-black/40 border border-white/5 rounded-3xl flex justify-between items-center group hover:border-purple-500/30 transition-all">
                            <div><p className="font-bold text-white text-sm uppercase">{p.title}</p><p className="text-[10px] text-gray-600 font-bold">RELEASE v{p.version}</p></div>
                            <button onClick={() => gun.get('p2p_projects').get(p.id).put(null)} className="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    {p2pProjects.length === 0 && <p className="text-center py-10 text-gray-700 col-span-2 text-[10px] font-black italic uppercase tracking-widest">Sin herramientas dinámicas</p>}
                </div>
            </section>
          </div>

        </div>

        {/* PRIORITY ANNOUNCEMENT */}
        <section className="p-10 rounded-[3rem] bg-yellow-500/5 border border-yellow-500/20 flex gap-8 items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="bg-yellow-500 p-5 rounded-2xl text-black shadow-lg shadow-yellow-500/20"><Megaphone size={28} className="animate-bounce" /></div>
            <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="flex-1 bg-transparent border-b-2 border-yellow-500/20 py-3 outline-none text-lg font-black text-yellow-200 placeholder:text-yellow-900/50" placeholder="EMITIR ANUNCIO GLOBAL PRIORITARIO..." />
            <button onClick={sendAnnouncement} className="px-10 py-4 bg-yellow-500 text-black font-black rounded-2xl text-xs hover:bg-yellow-400 shadow-xl shadow-yellow-500/10 transition-all uppercase tracking-widest">Emitir</button>
        </section>

      </div>
    </main>
  )
}
