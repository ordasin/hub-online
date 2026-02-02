'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, Package, Trash2, Wifi, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const MASTER_PUB = "9JYCRiw5sn2K5pkVI7nK9kslkyXHBSAWsyX6cKfFjAA.o576ix9BagmJ7z7XdozFoe-LIyavCmo-O7TrfRERzBs";
// Refresco de despliegue forzado para GitHub Pages v1.2
const PEERS = [
  'wss://gun.v6.rocks/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [detectedPub, setDetectedPub] = useState<string>("")
  const [gun, setGun] = useState<any>(null)
  const [threats, setThreats] = useState<any[]>([])
  const [p2pProjects, setP2pProjects] = useState<any[]>([])
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })
  const [socialPost, setSocialPost] = useState('')
  const [peers, setPeers] = useState(0)
  const [activePeer, setActivePeer] = useState<string>("Buscando...")

  useEffect(() => {
    const init = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const g = Gun({ 
        peers: PEERS, 
        localStorage: true,
        retry: 1000 
      });
      setGun(g);

      g.on('hi', (peer: any) => {
        setPeers(p => p + 1);
        setActivePeer(peer.url || "Nodo Desconocido");
        console.log("✅ Conectado a:", peer.url);
      });

      // Capturamos errores de conexión para saber si hay bloqueo
      // @ts-expect-error Gun internal events
      g.on('out', (msg) => {
        if (msg.err) {
          console.error("❌ Error de salida/bloqueo:", msg.err);
          if (msg.err === 'Unsupported record type') return; // Ignorar errores comunes
          toast.error("Error de Red: Posible bloqueo de IP");
        }
      });

      g.on('bye', (peer: any) => {
        setPeers(p => Math.max(0, p - 1));
        console.warn("⚠️ Nodo desconectado:", peer.url);
      });
      
      // @ts-expect-error Gun types not available
      const user = g.user().recall({ sessionStorage: true });
      
      const sync = () => {
        const currentUser = g.user();
        if (currentUser.is) {
          const currentPub = currentUser.is.pub;
          setDetectedPub(currentPub);
          console.log("ID Detectada:", currentPub);

          const normalizedMaster = MASTER_PUB.replace(/^~/, '').trim();
          const normalizedCurrent = currentPub.replace(/^~/, '').trim();

          if (normalizedCurrent === normalizedMaster) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      };

      // Intentar sincronizar cada segundo durante los primeros 15 segundos
      let attempts = 0;
      const syncInterval = setInterval(() => {
        if (g.user().is) {
          sync();
          clearInterval(syncInterval);
        }
        attempts++;
        if (attempts > 15 && !g.user().is) {
          setIsAdmin(false);
          clearInterval(syncInterval);
        }
      }, 1000);

      g.on('auth', sync);

      g.get('ORDASIN_FINAL_SHIELD').map().on((data: any, id: string) => {
        console.log("Amenaza recibida en Admin:", data);
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
      // @ts-expect-error Gun is loaded via CDN
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

  const forceReconnect = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (isAdmin === null) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono space-y-4">
      <div className="text-purple-500 uppercase text-[10px] animate-pulse">Verificando Firma Criptográfica...</div>
      <button onClick={forceReconnect} className="text-[9px] text-gray-600 hover:text-white border border-white/5 px-4 py-1 rounded-full">¿No conecta? Forzar Reseteo</button>
    </div>
  );
  if (isAdmin === false) return (
    <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-black p-10 text-center uppercase tracking-widest space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl">Acceso Denegado</h2>
        <p className="text-[10px] text-red-900 font-mono italic">
          {!detectedPub ? "No se detecta ninguna sesión activa en este dispositivo" : "Firma criptográfica no autorizada"}
        </p>
      </div>

      {detectedPub ? (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl max-w-2xl space-y-4">
          <p className="text-gray-500 text-[8px] uppercase tracking-widest">Firma Detectada:</p>
          <code className="text-[10px] text-purple-400 break-all block p-4 bg-black/50 rounded-xl border border-white/5">{detectedPub}</code>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] text-gray-600 animate-pulse">Debes identificarte en la red P2P primero</div>
          <button onClick={() => window.location.href='/login'} className="px-10 py-4 bg-purple-600 text-white text-xs rounded-2xl hover:bg-purple-500 transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)]">INICIAR SESIÓN MAESTRA</button>
        </div>
      )}
      
      <div className="flex gap-4 pt-8">
        <button onClick={forceReconnect} className="px-6 py-2 border border-white/10 text-gray-500 text-[10px] rounded-full hover:text-white transition-all">Limpiar y Reintentar</button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      {/* Botón de Emergencia Flotante */}
      <button 
        onClick={forceReconnect} 
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-red-900/20 border border-red-500/50 text-red-500 text-[8px] font-black uppercase rounded-full hover:bg-red-500 hover:text-white transition-all backdrop-blur-md"
      >
        Limpiar Red y Resetear
      </button>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-8 rounded-[3rem] bg-gradient-to-r from-red-900/20 via-black to-purple-900/20 border border-white/10 flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Shield size={32} /></div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest italic text-white">Master System</h1>
                <div className="flex flex-col gap-1 text-[10px] text-green-500 font-black mt-1">
                    <div className="flex items-center gap-2">
                      <Wifi size={12} className={peers > 0 ? 'animate-bounce' : ''}/> NODOS ACTIVOS: {peers}
                    </div>
                    <div className="text-gray-500 opacity-50 uppercase tracking-tighter">
                      Relay: {activePeer}
                    </div>
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