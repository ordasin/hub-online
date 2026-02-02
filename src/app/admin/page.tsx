'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, Package, Plus, Trash2, Wifi, Megaphone, Send, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "_VFsB7wZfL0sqU6GGW5ucTjkBOazp-CR6B4_52-1rOY.iNt-9rXPnGyZbTXfk2AyqVtnATVgEAU_dbCoOySYT4w";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })
  const [socialPost, setSocialPost] = useState('')
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const g = Gun({ peers: PEERS, localStorage: true });
      setGun(g);

      g.on('hi', () => setPeers(p => p + 1));
      g.on('bye', () => setPeers(p => Math.max(0, p - 1)));
      
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      
      const sync = () => {
        if (user.is && user.is.pub === MASTER_PUB) {
          setIsAdmin(true);
        } else if (user.is) {
          setIsAdmin(false);
        } else {
          setTimeout(() => { if (!user.is) setIsAdmin(false); }, 3000);
        }
      };

      sync();
      g.on('auth', sync);

      g.get('ORDASIN_FINAL_SHIELD').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => [data, ...prev.filter(t => t.id !== id)].sort((a,b) => b.time - a.time).slice(0, 10));
        }
      });

      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(loader); }
    }, 1000);
    return () => clearInterval(loader);
  }, [])

  const publishProject = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set({ ...newProject, title: DOMPurify.sanitize(newProject.title), time: Date.now() });
      setNewProject({ title: '', version: '', desc: '' });
      toast.success("Publicado en la red");
    }
  }

  const postToFeed = () => {
    if (gun && socialPost) {
      gun.get('global_social_feed').set({ text: DOMPurify.sanitize(socialPost), author: 'Master Admin', time: Date.now() });
      setSocialPost('');
      toast.success("Feed actualizado");
    }
  }

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-purple-500 uppercase text-[10px] animate-pulse">Verificando Firma Criptográfica...</div>;
  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black p-10 text-center uppercase tracking-widest">Acceso Denegado: Identidad no Autorizada</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-8 rounded-[3rem] bg-gradient-to-r from-red-900/20 via-black to-purple-900/20 border border-white/10 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic text-white">Master System</h1>
                <div className="flex items-center gap-2 text-[10px] text-green-500 font-black mt-1">
                    <Wifi size={12} className={peers > 0 ? 'animate-bounce' : ''}/> NODOS ACTIVOS: {peers}
                </div>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-500 hover:text-white transition-all">EXIT</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 shadow-2xl">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400"><Activity size={18}/> Invasores</h2>
                <div className="space-y-3">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl text-[9px]">
                            <p className="font-black text-red-500 uppercase">{new Date(t.time).toLocaleTimeString()} - DETECTED</p>
                            <p className="text-gray-500 truncate mt-1">{t.details}</p>
                        </div>
                    ))}
                    {threats.length === 0 && <p className="text-center py-10 text-gray-700 text-xs italic">Vigilando red...</p>}
                </div>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-4 shadow-2xl">
                <h2 className="text-lg font-black uppercase flex items-center gap-2 text-blue-400"><Send size={18}/> Feed Maestro</h2>
                <textarea value={socialPost} onChange={(e) => setSocialPost(e.target.value)} className="w-full h-24 bg-black border border-white/10 rounded-xl p-3 text-xs outline-none" placeholder="Noticia global..." />
                <button onClick={postToFeed} className="w-full py-3 bg-blue-600 rounded-xl font-black text-xs hover:bg-blue-500 transition-all">Postear</button>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 shadow-2xl">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400"><Package size={20}/> Publicar Software</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nombre" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <textarea placeholder="Descripción detallada..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={publishProject} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all">EMITIR AL HUB</button>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 shadow-2xl">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-gray-400"><Terminal size={20}/> Catálogo P2P</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pProjects.map(p => (
                        <div key={p.id} className="p-5 bg-black border border-white/5 rounded-3xl flex justify-between items-center group hover:border-purple-500/30 transition-all">
                            <div><p className="font-bold text-white text-sm uppercase">{p.title}</p><p className="text-[10px] text-gray-600">v{p.version}</p></div>
                            <button onClick={() => gun.get('p2p_projects').get(p.id).put(null)} className="p-3 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}