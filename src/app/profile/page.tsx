'use client'

import { useState, useEffect } from 'react'
import { Shield, Save, RefreshCw, Key, Globe, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  const [pub, setPub] = useState('')
  const [gunUser, setGunUser] = useState<unknown>(null)
  
  const [config, setConfig] = useState({ optimizer: 'adam', lr: 0.001, weight_decay: 0.01 })
  const [saving, setSaving] = useState(false)

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
        
        user.get('advanced_optimizer_config').once((data: Record<string, unknown>) => {
          if (data) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _, ...cleanData } = data;
            setConfig(prev => ({ ...prev, ...cleanData }));
          }
        });
      } else {
        // Redirigir al login si no hay sesión tras 3 segundos
        setTimeout(() => { if (!user.is) window.location.href = '/login'; }, 3000);
      }
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(checker); }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  const saveConfig = () => {
    // @ts-expect-error user.get is internal gun method
    if (!gunUser || !gunUser.get) return;
    setSaving(true);
    // @ts-expect-error put is internal gun method
    gunUser.get('advanced_optimizer_config').put(config, (ack: { err: string }) => {
      setSaving(false);
      if (!ack.err) toast.success("Preferencias guardadas en la red P2P");
    });
  }

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-white animate-pulse">
        AUTENTICANDO IDENTIDAD...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl">{alias[0]?.toUpperCase()}</div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter">{alias}</h1>
              <div className="flex gap-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full bg-purple-500/5"><Shield size={12}/> Nodo Autorizado</span>
                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full bg-blue-500/5"><Globe size={12}/> Red P2P</span>
              </div>
            </div>
          </div>
          <button onClick={saveConfig} disabled={saving} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-xl disabled:opacity-50">
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
            <span className="ml-2">SINCRONIZAR</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Identity Card */}
            <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-3 italic"><Key size={20} className="text-purple-500"/> Firma Criptográfica</h2>
                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 break-all">
                    <code className="text-[10px] text-gray-400 font-bold leading-relaxed">{pub}</code>
                </div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed italic">Esta es tu llave pública única e inmutable en la red descentralizada de Ordasin Hub.</p>
            </div>

            {/* Stats Card */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-white/10 space-y-6">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Activity size={16}/> Estado Local</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-xs text-gray-500 font-bold">SESIÓN</span>
                        <span className="text-xs text-green-500 font-black">ACTIVA</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-xs text-gray-500 font-bold">CIFRADO</span>
                        <span className="text-xs text-blue-500 font-black">AES-256</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-bold">ALMACÉN</span>
                        <span className="text-xs text-purple-500 font-black">RADISK</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  )
}
