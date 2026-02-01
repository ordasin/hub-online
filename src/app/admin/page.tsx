'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Server, Trash2, Home, AlertCircle, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

const SERVERS = [
  { name: 'Relay Principal', url: 'wss://relay.gun.eco/gun' },
  { name: 'Manhattan Node', url: 'wss://gun-manhattan.herokuapp.com/gun' },
  { name: 'Backup Alpha', url: 'wss://gun-us.herokuapp.com/gun' },
  { name: 'Backup Beta', url: 'wss://peer.wall.org/gun' }
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [serverLogs, setServerLogs] = useState<any>({})
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    let gunInstance: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const peerUrls = SERVERS.map(s => s.url);
      
      gunInstance = Gun({
        peers: peerUrls,
        localStorage: true,
        webRTC: false // Desactivamos WebRTC para evitar cuelgues de red
      });
      setGun(gunInstance);

      // Monitor de Red nivel bajo
      const timer = setInterval(() => {
        const mesh = gunInstance.back('opt.peers');
        const statusUpdate: any = {};
        let active = 0;

        SERVERS.forEach(s => {
          const p = mesh[s.url];
          if (p && p.wire && p.wire.readyState === 1) {
            statusUpdate[s.name] = { status: 'ONLINE', color: 'text-green-500' };
            active++;
          } else if (p && p.wire) {
            statusUpdate[s.name] = { status: 'ERROR ' + p.wire.readyState, color: 'text-orange-500' };
          } else {
            statusUpdate[s.name] = { status: 'CONNECTING...', color: 'text-red-500' };
          }
        });
        setServerLogs(statusUpdate);
        setPeers(active);
      }, 2000);

      // Verificación Admin
      // @ts-ignore
      const user = gunInstance.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);

      // Escuchar Alertas
      gunInstance.get('ORDASIN_SEC_CORE_V10').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            toast.error("AMENAZA DETECTADA");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 20);
          });
        }
      });

      return () => {
        clearInterval(timer);
        if (gunInstance) gunInstance.off();
      };
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(loader);
      }
    }, 500);
    return () => clearInterval(loader);
  }, [])

  if (!isAdmin) return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono p-6 text-center">
        <div className="space-y-4">
            <AlertCircle size={48} className="mx-auto animate-bounce" />
            <h1 className="text-xl font-black uppercase tracking-widest">Acceso Denegado</h1>
            <p className="text-xs text-red-900">Inicia sesión como Master Admin para ver la consola.</p>
            <button onClick={() => window.location.href='/login'} className="mt-6 px-6 py-2 bg-white text-black font-black rounded-full text-[10px]">LOGIN</button>
        </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Header Status */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-red-900/20 to-black border-2 border-red-600/20 backdrop-blur-xl flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Shield size={40} className="text-red-600 animate-pulse" />
                <h1 className="text-3xl font-black uppercase tracking-tighter">Command Unit</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-green-400">{peers}</p>
                <p className="text-[10px] font-black text-gray-600 uppercase">Relés Activos</p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 px-4 tracking-widest"><Activity size={14}/> Live Intrusion Stream</h2>
                <div className="grid grid-cols-1 gap-2">
                    {threats.map(t => (
                        <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                            <span className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza Detectada</span>
                            <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {threats.length === 0 && <div className="text-center py-20 text-gray-800 uppercase text-[10px] font-black italic tracking-widest animate-pulse">Monitorizando malla P2P...</div>}
                </div>
            </div>
          </div>

          {/* Network Scanner Side */}
          <aside className="space-y-8">
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <h2 className="text-[10px] font-black text-gray-500 uppercase mb-6 flex items-center gap-2 tracking-widest"><Server size={14}/> Network Mesh</h2>
                <div className="space-y-4">
                    {SERVERS.map(s => (
                        <div key={s.name} className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{s.name}</span>
                            <span className={`text-[9px] font-black ${serverLogs[s.name]?.color || 'text-gray-600'}`}>
                                {serverLogs[s.name]?.status || 'WAITING...'}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-10 pt-6 border-t border-white/5">
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">Reiniciar Red</button>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
