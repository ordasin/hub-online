'use client'

import { useState, useEffect } from 'react'
import { Settings, Shield, Zap, Save, RefreshCw, Cpu, Database, Gauge, Sliders, Activity, Binary } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  const [gunUser, setGunUser] = useState<any>(null)
  
  const [config, setConfig] = useState({
    optimizer: 'adam',
    lr: 0.001,
    weight_decay: 0.01,
    fp16: false,
    bf16: true,
    adam_beta1: 0.9,
    adam_beta2: 0.999,
    clip_grad: 1.0,
    use_distributed_optimizer: false
  })
  
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const gun = Gun({ peers: PEERS });
      const user = (gun as any).user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setAlias(user.is.alias);
        
        user.get('advanced_optimizer_config').once((data: any) => {
          if (data) {
            const { _, ...cleanData } = data;
            const parsedData = Object.keys(cleanData).reduce((acc: any, key) => {
              const val = cleanData[key];
              acc[key] = (typeof val === 'string' && !isNaN(Number(val)) && val !== '') ? Number(val) : val;
              if (val === 'true') acc[key] = true;
              if (val === 'false') acc[key] = false;
              return acc;
            }, {});
            setConfig(prev => ({ ...prev, ...parsedData }));
          }
        });
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    };

    if (typeof window !== 'undefined') initGun();
  }, [])

  const saveConfig = () => {
    if (!gunUser) return;
    setSaving(true);
    gunUser.get('advanced_optimizer_config').put(config, (ack: any) => {
      setSaving(false);
      if (!ack.err) {
        toast.success("Ajustes sincronizados en la red P2P");
      } else {
        toast.error("Error al sincronizar");
      }
    });
  }

  const updateField = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" /></div>
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl">{alias[0]?.toUpperCase()}</div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{alias}</h1>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1"><Shield size={12} /> Identidad Cifrada</span>
            </div>
          </div>
          <button onClick={saveConfig} disabled={saving} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs flex items-center gap-3 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50">
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            SINCRONIZAR AJUSTES
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-8">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3"><Sliders className="text-purple-400" /> OPTIMIZER CONFIG</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Engine</label>
                    <select value={config.optimizer} onChange={(e) => updateField('optimizer', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500"><option value="adam" className="bg-[#0a0a0a]">Adam</option><option value="sgd" className="bg-[#0a0a0a]">SGD</option></select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Learning Rate ({config.lr})</label>
                    <input type="range" min="0.0001" max="0.1" step="0.0001" value={config.lr} onChange={(e) => updateField('lr', parseFloat(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight Decay</label>
                    <input type="number" step="0.001" value={config.weight_decay} onChange={(e) => updateField('weight_decay', parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white" />
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"><h3 className="font-black text-xs uppercase tracking-widest mb-4">Estado Red</h3><div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">Integridad</span><span className="text-green-400 font-black">100%</span></div></div>
        </div>
      </div>
    </main>
  )
}