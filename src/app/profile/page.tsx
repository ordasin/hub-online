'use client'

import { useState, useEffect } from 'react'
import Gun from 'gun'
import 'gun/sea'
import { User, Settings, Shield, Zap, Save, RefreshCw, Cpu, Database } from 'lucide-react'
import { motion } from 'framer-motion'

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const user = (gun as any).user().recall({ sessionStorage: true });

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')
  const [config, setConfig] = useState({
    gamingMode: false,
    lowLatency: true,
    cleaningPower: 'Medium',
    autoUpdate: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user.is) {
      setIsLoggedIn(true);
      setAlias(user.is.alias);
      
      // Cargar configuración guardada en P2P
      user.get('optimizer_config').once((data: any) => {
        if (data) {
          const { _, ...cleanData } = data; // Quitar metadatos de Gun
          setConfig(prev => ({ ...prev, ...cleanData }));
        }
      });
    } else {
      window.location.href = '/login';
    }
  }, [])

  const saveConfig = () => {
    setSaving(true);
    user.get('optimizer_config').put(config, (ack: any) => {
      setSaving(false);
      if (!ack.err) alert('Configuración P2P guardada con éxito');
    });
  }

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Cabecera del Perfil */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl">
            {alias[0]?.toUpperCase()}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase">{alias}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1">
                <Shield size={12} /> ID Verificado P2P
              </span>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <Database size={12} /> Datos Cifrados
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuración del Optimizador */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Settings className="text-purple-400" />
                AJUSTES DEL OPTIMIZADOR
              </h2>
              <button 
                onClick={saveConfig}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-xs font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20"
              >
                {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                GUARDAR EN LA RED
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'gamingMode', label: 'Modo Gaming Pro', desc: 'Prioriza procesos de juegos.', icon: Zap },
                { id: 'lowLatency', label: 'Latencia Ultra-Baja', desc: 'Optimiza la red P2P.', icon: Cpu },
                { id: 'autoUpdate', label: 'Auto-Actualización', desc: 'Mantiene las herramientas al día.', icon: RefreshCw },
              ].map((item) => (
                <div key={item.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.label}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setConfig(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof config] }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${config[item.id as keyof typeof config] ? 'bg-purple-600' : 'bg-gray-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config[item.id as keyof typeof config] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Estadísticas / Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 backdrop-blur-xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-4">Estado del Nodo</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold">Conexión</span>
                  <span className="text-green-400 font-black">ACTIVA</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold">Relé P2P</span>
                  <span className="text-blue-400 font-black">GUN-MANHATTAN</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[85%] animate-pulse" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-4">Seguridad</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Tus ajustes están firmados criptográficamente. Solo tú puedes modificarlos usando tu llave privada generada localmente.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
