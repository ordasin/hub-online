'use client'

import { useState, useEffect } from 'react'
import { Shield, Save, RefreshCw, Key, Globe, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  const [pub, setPub] = useState('')
  const [joined, setJoined] = useState('')
  const [gunUser, setGunUser] = useState<any>(null)
  
  const [config, setConfig] = useState({ optimizer: 'adam', lr: 0.001, weight_decay: 0.01 })
  const [saving, setSaving] = useState(false)

  const MASTER_PUB = "6mwMzGdVuCtE-sd_7_5RJ5AUeEbA-i3JwZ0UjiaxAtE.KH6lWH55LxsAE2D7ZBQQKlJgod5hqIHzwcoJ25gjqHo";

  useEffect(() => {
    const init = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: ['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun'], localStorage: true });
      // @ts-expect-error Gun types not available
      const user = gun.user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setAlias(user.is.alias);
        setPub(user.is.pub);
        
        user.get('profile_joined').once((date: string) => {
          if (!date) {
            const now = new Date().toLocaleDateString();
            user.get('profile_joined').put(now);
            setJoined(now);
          } else {
            setJoined(date);
          }
        });

        user.get('advanced_optimizer_config').once((data: Record<string, unknown>) => {
          if (data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _, ...cleanData } = data;
            setConfig(prev => ({ ...prev, ...cleanData }));
          }
        });
      } else {
        setTimeout(() => { if (!user.is) window.location.href = '/login'; }, 3000);
      }
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(checker); }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  const isMaster = pub === MASTER_PUB;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Identity Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative p-1 overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-500/20 via-white/5 to-blue-500/20 shadow-2xl"
        >
          <div className="p-10 rounded-[2.9rem] bg-black/90 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-3xl">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className={`w-32 h-32 ${isMaster ? 'bg-red-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'} rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-[0_0_40px_rgba(147,51,234,0.3)] border-2 border-white/10`}>
                  {alias[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase text-green-500 animate-pulse">Online</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <h1 className="text-5xl font-black uppercase tracking-tighter italic">{alias}</h1>
                  <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isMaster ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                    {isMaster ? 'Master Developer' : 'Operativo Hub'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Shield size={12} className="text-purple-500"/> Identidad Verificada
                  </span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Globe size={12} className="text-blue-500"/> Nodo: Global-Relay-01
                  </span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Save size={12} className="text-green-500"/> Registro: {joined}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button onClick={() => window.location.href = '/admin'} className={`px-8 py-4 ${isMaster ? 'bg-white text-black' : 'bg-white/5 text-gray-500'} font-black rounded-2xl transition-all shadow-xl text-xs uppercase italic`}>
                Panel de Control
              </button>
              <button onClick={() => {
                if (gunUser) gunUser.leave();
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }} className="px-8 py-2 text-[10px] font-black uppercase text-gray-600 hover:text-red-500 transition-colors">Cerrar Sesión Criptográfica</button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Security DNA */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                  <h2 className="text-xl font-black uppercase flex items-center gap-3 italic text-purple-400"><Key size={20}/> ADN Digital (Public Key)</h2>
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 break-all group relative">
                      <code className="text-[10px] text-gray-500 font-bold leading-relaxed">{pub}</code>
                      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Reputación</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-1/3" />
                        </div>
                        <span className="text-[10px] font-black">NIVEL 1</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Contribuciones</p>
                      <p className="text-lg font-black italic">0 SCRIPTS</p>
                    </div>
                  </div>
              </div>

              {/* Lab Access Card */}
              <div className="p-10 rounded-[3rem] bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 flex items-center justify-between group cursor-pointer hover:border-purple-500/50 transition-all">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Acceso al Laboratorio</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase">Sube tus propios scripts a la red descentralizada</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Activity size={20} />
                </div>
              </div>
            </div>

            {/* Network Card */}
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-8 h-fit">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-400"><Globe size={16}/> Protocolos Activos</h2>
                <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-500">Sincronización P2P</span>
                        <span className="text-green-500">Estable</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ x: [-100, 200] }} transition={{ repeat: Infinity, duration: 3 }} className="w-20 h-full bg-green-500/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-500">Cifrado de Capa</span>
                        <span className="text-blue-500">AES-GCM</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full" />
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[8px] text-gray-600 font-bold leading-relaxed uppercase">
                        Tu identidad está protegida por una firma elíptica (SEA). Nadie más puede modificar tus datos en la red.
                      </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}
