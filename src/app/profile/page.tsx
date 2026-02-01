'use client'

import { useState, useEffect } from 'react'
import { Shield, Save, RefreshCw, Sliders } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  const [gunUser, setGunUser] = useState<any>(null)
  
  const [config, setConfig] = useState({ optimizer: 'adam', lr: 0.001, weight_decay: 0.01 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun(['https://relay.gun.eco/gun']);
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setAlias(user.is.alias);
        user.get('advanced_optimizer_config').once((data: any) => {
          if (data) {
            const { _, ...cleanData } = data;
            setConfig(prev => ({ ...prev, ...cleanData }));
          }
        });
      } else {
        window.location.href = '/login';
      }
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(checker); }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  const saveConfig = () => {
    if (!gunUser) return;
    setSaving(true);
    gunUser.get('advanced_optimizer_config').put(config, (ack: any) => {
      setSaving(false);
      if (!ack.err) toast.success("Configuración P2P guardada");
    });
  }

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 flex justify-between items-center backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black">{alias[0]?.toUpperCase()}</div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter">{alias}</h1>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full"><Shield size={12}/> Identidad Protegida</span>
            </div>
          </div>
          <button onClick={saveConfig} disabled={saving} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all">
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} SINCRONIZAR
          </button>
        </div>
      </div>
    </main>
  )
}
