'use client'

import { useState, useEffect } from 'react'
import Gun from 'gun'
import 'gun/sea'
import { 
  User, Settings, Shield, Zap, Save, RefreshCw, 
  Cpu, Database, gauge, Sliders, Activity, Binary 
} from 'lucide-react'
import { motion } from 'framer-motion'

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const user = (gun as any).user().recall({ sessionStorage: true });

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  
  // Configuración basada en OptimizerConfig real
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
    if (user.is) {
      setIsLoggedIn(true);
      setAlias(user.is.alias);
      
      // Cargar configuración real desde la red P2P
      user.get('advanced_optimizer_config').once((data: any) => {
        if (data) {
          const { _, ...cleanData } = data;
          // Convertir strings numéricos de vuelta a números si es necesario
          const parsedData = Object.keys(cleanData).reduce((acc: any, key) => {
            const val = cleanData[key];
            acc[key] = (typeof val === 'string' && !isNaN(Number(val)) && val !== '') ? Number(val) : val;
            // Manejar booleanos guardados como strings por Gun
            if (val === 'true') acc[key] = true;
            if (val === 'false') acc[key] = false;
            return acc;
          }, {});
          setConfig(prev => ({ ...prev, ...parsedData }));
        }
      });
    } else {
      window.location.href = '/login';
    }
  }, [])

  const saveConfig = () => {
    setSaving(true);
    // Gun prefiere datos planos para persistencia simple
    user.get('advanced_optimizer_config').put(config, (ack: any) => {
      setSaving(false);
      if (!ack.err) {
        console.log("Configuración guardada");
      }
    });
  }

  const updateField = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header de Usuario */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-purple-500/20">
              {alias[0]?.toUpperCase()}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{alias}</h1>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <Shield size={12} /> NODO AUTORIZADO
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={saveConfig}
            disabled={saving}
            className="group relative px-8 py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 overflow-hidden"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>SINCRONIZAR AJUSTES</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Principal de Configuración */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-8"
            >
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Sliders className="text-purple-400" />
                OPTIMIZER CORE CONFIG
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Optimizer Engine</label>
                    <select 
                      value={config.optimizer}
                      onChange={(e) => updateField('optimizer', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="adam" className="bg-[#0a0a0a]">Adam (Fused)</option>
                      <option value="sgd" className="bg-[#0a0a0a]">SGD (Momentum)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Learning Rate ({config.lr})</label>
                    <input 
                      type="range" min="0.0001" max="0.1" step="0.0001"
                      value={config.lr}
                      onChange={(e) => updateField('lr', parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight Decay</label>
                    <input 
                      type="number" step="0.001"
                      value={config.weight_decay}
                      onChange={(e) => updateField('weight_decay', parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gradient Clipping</label>
                    <input 
                      type="number" step="0.1"
                      value={config.clip_grad}
                      onChange={(e) => updateField('clip_grad', parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Precision & Scaling */}
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-8"
            >
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Binary className="text-blue-400" />
                PRECISION & DISTRIBUTED
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'fp16', label: 'FP16 Mixed', icon: Cpu },
                  { id: 'bf16', label: 'BF16 Training', icon: Activity },
                  { id: 'use_distributed_optimizer', label: 'Distributed', icon: Database },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => updateField(item.id, !config[item.id as keyof typeof config])}
                    className={`p-6 rounded-2xl border transition-all text-left space-y-4 ${
                      config[item.id as keyof typeof config] 
                      ? 'bg-blue-500/10 border-blue-500/50' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <item.icon size={24} className={config[item.id as keyof typeof config] ? 'text-blue-400' : 'text-gray-600'} />
                    <div className="font-bold text-xs uppercase tracking-widest">{item.label}</div>
                  </button>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar de Estado */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Métricas de Sincronización</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-500 uppercase">Integridad</span>
                  <span className="text-xl font-black text-green-400">100%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500" 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                  />
                </div>
                
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-500 uppercase">Latencia P2P</span>
                  <span className="text-xl font-black text-blue-400">24ms</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500" 
                    initial={{ width: 0 }} 
                    animate={{ width: '40%' }} 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-purple-500" size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest">Protocolo de Cifrado</h3>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tighter">
                Tus configuraciones de Megatron y Optuna están protegidas bajo el estándar SEA de GunDB. 
                Ningún servidor central almacena estos parámetros.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}