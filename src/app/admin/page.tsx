'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Home, Package, Plus, Trash2, Wifi, Megaphone, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const GLOBAL_PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })
  const [socialPost, setSocialPost] = useState('')

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun({ peers: GLOBAL_PEERS });
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      // Escuchar Alertas Globales
      g.get('SECURITY_ALERTS').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            const filtered = prev.filter(t => t.id !== id);
            return [data, ...filtered].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });

      // Notificación instantánea entre navegadores
      g.get('LATEST_ALERT').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error("! INTRUSIÓN EXTERNA DETECTADA !", { 
            description: `${data.details} desde ${data.ua?.split(') ')[0] || 'Navegador'}`,
            duration: 8000
          });
        }
      });

      // Escuchar Proyectos
      g.get('p2p_projects').map().on((data: any, id: string) => {
        if (data) setP2pProjects(prev => [...prev.filter(p => p.id !== id), { ...data, id }]);
        else setP2pProjects(prev => prev.filter(p => p.id !== id));
      });
    };
    init();
  }, [])

  const publishProject = () => {
    if (gun && newProject.title) {
      gun.get('p2p_projects').set({ ...newProject, title: DOMPurify.sanitize(newProject.title), time: Date.now() });
      setNewProject({ title: '', version: '', desc: '' });
      toast.success("Publicado globalmente");
    }
  }

  const postToFeed = () => {
    if (gun && socialPost) {
      gun.get('global_social_feed').set({
        text: DOMPurify.sanitize(socialPost),
        author: 'Master Admin',
        time: Date.now()
      });
      setSocialPost('');
      toast.success("Post emitido");
    }
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-900/20 via-black to-purple-900/20 border border-white/10 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic">Hub Admin V2</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.3em]">RED GLOBAL P2P: SINCRONIZADA</p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-500 hover:text-white transition-all uppercase">Escritorio</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AMENAZAS */}
          <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
              <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400"><Activity size={18}/> Global Alerts</h2>
              <div className="space-y-3">
                  {threats.map(t => (
                      <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl text-[9px] hover:bg-red-900/20 transition-all">
                          <p className="font-black text-red-500 uppercase">{new Date(t.time).toLocaleTimeString()}</p>
                          <p className="text-gray-400 truncate mt-1">{t.details}</p>
                      </div>
                  ))}
                  {threats.length === 0 && <p className="text-center py-10 text-gray-700 text-xs italic uppercase">Escaneando red mundial...</p>}
              </div>
          </section>

          {/* GESTOR */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400"><Package size={20}/> Emitir Software</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Software" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                </div>
                <textarea placeholder="Descripción del sistema..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black border border-white/10 rounded-xl p-4 text-xs outline-none" />
                <button onClick={publishProject} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 shadow-xl transition-all">ENVIAR A LA MALLA GLOBAL</button>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-gray-400"><Terminal size={20}/> Herramientas en Malla</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p2pProjects.map(p => (
                        <div key={p.id} className="p-5 bg-black border border-white/5 rounded-3xl flex justify-between items-center hover:border-purple-500/30 transition-all">
                            <div><p className="font-bold text-white text-sm uppercase">{p.title}</p><p className="text-[10px] text-gray-600 font-bold">v{p.version}</p></div>
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