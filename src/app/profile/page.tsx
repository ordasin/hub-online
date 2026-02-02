'use client'

import { useState, useEffect } from 'react'
import { Shield, Key, Globe, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [alias, setAlias] = useState('')
  const [pub, setPub] = useState('')
  const [joined, setJoined] = useState('')
  const [xp, setXp] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gunUser, setGunUser] = useState<any>(null)
  
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

        // Cargar XP en tiempo real
        user.get('profile_xp').on((val: number) => {
          setXp(val || 0);
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
  
  // Lógica de Niveles
  const getLevel = (pts: number) => {
    if (isMaster) return { n: 99, title: "Master Developer", next: 0, color: "text-red-500" };
    if (pts >= 600) return { n: 4, title: "Especialista en Cifrado", next: 1000, color: "text-yellow-500" };
    if (pts >= 300) return { n: 3, title: "Analista de Red", next: 600, color: "text-blue-500" };
    if (pts >= 100) return { n: 2, title: "Técnico de Campo", next: 300, color: "text-green-500" };
    return { n: 1, title: "Operativo Base", next: 100, color: "text-purple-500" };
  };

  const level = getLevel(xp);
  const progress = isMaster ? 100 : Math.min((xp / (level.next || 1)) * 100, 100);

  if (!isLoggedIn && typeof window !== 'undefined') return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white animate-pulse">
        AUTENTICANDO IDENTIDAD...
    </div>
  );

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
                    {level.title}
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
                    <Activity size={12} className="text-green-500"/> Registro: {joined}
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase flex items-center gap-3 italic text-purple-400"><Key size={20}/> ADN Digital</h2>
                    <div className="text-[10px] font-black uppercase text-gray-500">XP TOTAL: <span className="text-white">{xp}</span></div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className={level.color}>RANGO {level.n}: {level.title}</span>
                      <span className="text-gray-600">SIGUIENTE NIVEL: {level.next} XP</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full border border-white/10 overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${isMaster ? 'from-red-600 to-orange-600' : 'from-purple-600 to-blue-600'} shadow-[0_0_15px_rgba(147,51,234,0.5)]`}
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 break-all group relative">
                      <code className="text-[10px] text-gray-500 font-bold leading-relaxed">{pub}</code>
                      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  </div>
              </div>

              {/* Badges Section */}
              <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-400">Medallas de Operativo</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-help">
                    <div className="text-2xl">🛡️</div>
                    <p className="text-[8px] font-black uppercase">Early Bird</p>
                  </div>
                  <div className={`p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2 transition-all ${xp > 0 ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'}`}>
                    <div className="text-2xl">💬</div>
                    <p className="text-[8px] font-black uppercase">Contributor</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2 grayscale opacity-50">
                    <div className="text-2xl">🐍</div>
                    <p className="text-[8px] font-black uppercase">Script Master</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2 grayscale opacity-50">
                    <div className="text-2xl">📡</div>
                    <p className="text-[8px] font-black uppercase">Node Host</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Card */}
            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-8 h-fit">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-blue-400"><Globe size={16}/> Protocolos Activos</h2>
                <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-500">Sincronización XP</span>
                        <span className="text-green-500">Live</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ x: [-100, 200] }} transition={{ repeat: Infinity, duration: 3 }} className="w-20 h-full bg-green-500/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-gray-500">ADN Criptográfico</span>
                        <span className="text-blue-500">SEA-256</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full" />
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[8px] text-gray-600 font-bold leading-relaxed uppercase">
                        Tu reputación en la red HUB 903 es inmutable. Los puntos de XP se almacenan en tu grafo personal descentralizado.
                      </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}
