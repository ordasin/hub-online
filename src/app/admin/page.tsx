'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, WifiOff, Trash2, Send, Server, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

const SERVERS = [
  { name: 'Manhattan', url: 'https://gun-manhattan.herokuapp.com/gun' },
  { name: 'GunJS Official', url: 'https://gunjs.herokuapp.com/gun' },
  { name: 'Relay Eco', url: 'https://relay.gun.eco/gun' },
  { name: 'Fire Peer', url: 'https://peer.wall.org/gun' }
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [serverStatus, setServerStatus] = useState<any>({})
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      if (!window.Gun) return;
      
      const peerUrls = SERVERS.map(s => s.url);
      // @ts-ignore
      const g = window.Gun({
        peers: peerUrls,
        localStorage: true,
        retry: 1000
      });
      setGun(g);

      // Monitor de estado por servidor
      const checkNetwork = setInterval(() => {
        try {
          const mesh = g.back('opt.peers');
          const statusMap: any = {};
          let activeCount = 0;

          SERVERS.forEach(s => {
            const peerInfo = mesh[s.url];
            if (peerInfo && peerInfo.wire && peerInfo.wire.readyState === 1) {
              statusMap[s.name] = 'online';
              activeCount++;
            } else {
              statusMap[s.name] = 'offline';
            }
          });

          setServerStatus(statusMap);
          setPeers(activeCount);
        } catch(e) {}
      }, 3000);

      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('ORDASIN_FINAL_SHIELD').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            if (data.time > Date.now() - 30000) toast.error("!!! AMENAZA DETECTADA !!!");
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });

      return () => clearInterval(checkNetwork);
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(checker);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP MONITOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-br from-red-900/20 to-black border border-red-600/20 backdrop-blur-xl flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Shield size={40} className="text-red-600 animate-pulse" />
                    <div>
                        <h1 className="text-3xl font-black uppercase italic">Hub Sentinel</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Estado: Vigilando Malla P2P</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-green-400">{peers}</p>
                    <p className="text-[10px] font-black text-gray-600 uppercase">Nodos Conectados</p>
                </div>
            </div>

            {/* SERVER SCANNER */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                    <Server size={14}/> Network Mesh Status
                </h3>
                <div className="space-y-2">
                    {SERVERS.map(s => (
                        <div key={s.name} className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-gray-400">{s.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={serverStatus[s.name] === 'online' ? 'text-green-500' : 'text-red-500'}>
                                    {serverStatus[s.name] === 'online' ? 'ONLINE' : 'CONNECTING...'}
                                </span>
                                {serverStatus[s.name] === 'online' ? <CheckCircle2 size={12} className="text-green-500"/> : <XCircle size={12} className="text-red-500 animate-pulse"/>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* THREATS */}
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-xl font-black uppercase flex items-center gap-2 text-red-400"><Activity size={20}/> Intrusion Logs</h2>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {threats.map(t => (
                    <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-red-500/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Señal de ataque recibida</p>
                        </div>
                        <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                    </div>
                ))}
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-xs font-black italic uppercase tracking-widest animate-pulse">Escaneando red mundial...</p>}
            </div>
        </div>

        <div className="flex gap-4">
            <button onClick={() => gun.get('ORDASIN_FINAL_SHIELD').put(null)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Limpiar Historial</button>
            <button onClick={() => window.location.href='/'} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all">Panel Principal</button>
        </div>
      </div>
    </main>
  )
}