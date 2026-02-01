'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Terminal, AlertTriangle, Trash2, Globe, Laptop, Cpu, ShieldAlert, Monitor, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [threats, setThreats] = useState<any[]>([])
  const [selectedThreat, setSelectedThreat] = useState<any>(null)
  const [gun, setGun] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun']);
      setGun(g);
      
      const user = (g as any).user().recall({ sessionStorage: true });
      if (user.is && user.is.pub === MASTER_PUB) setIsAdmin(true);
      else if (typeof window !== 'undefined') window.location.href = '/login';

      g.get('SECURITY_ALERTS_V2').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => [data, ...prev.filter(t => t.id !== id)].sort((a,b) => b.time - a.time).slice(0, 50));
        }
      });

      g.get('LATEST_ALERT_DETAIL').on((data: any) => {
        if (data && data.time > Date.now() - 30000) {
          toast.error("¡INTRUSIÓN DE ALTO NIVEL!", { 
            description: `Tipo: ${data.type} detectado`,
            duration: 10000
          });
        }
      });
    };
    init();
  }, [])

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-8 border border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <ShieldAlert size={40} className="text-red-600 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Forensics Intelligence</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => gun.get('SECURITY_ALERTS_V2').put(null)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black hover:bg-red-600 transition-all">PURGAR EXPEDIENTES</button>
            <button onClick={() => window.location.href='/'} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black hover:bg-purple-500 hover:text-white transition-all">HUB</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE ATAQUES */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Historial de Capturas</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {threats.map(t => (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        key={t.id} 
                        onClick={() => setSelectedThreat(t)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all ${selectedThreat?.id === t.id ? 'bg-red-600 border-red-400' : 'bg-white/5 border-white/10 hover:border-red-500/50'}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-black text-[10px] uppercase">{t.type}</span>
                            <span className="opacity-50 text-[9px]">{new Date(t.time).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] mt-1 truncate opacity-70 italic">{t.details}</p>
                    </motion.div>
                ))}
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 text-xs italic">Escaneando red mundial...</p>}
            </div>
          </div>

          {/* EXPEDIENTE DETALLADO */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
                {selectedThreat ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key={selectedThreat.id} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black rounded-full uppercase">Expediente {selectedThreat.id}</span>
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-red-500">{selectedThreat.type}</h2>
                            </div>
                            <Activity className="text-red-600" size={32} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Detalles Técnicos */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Terminal size={12}/> Análisis del Payload</h3>
                                    <div className="p-4 bg-black rounded-2xl border border-red-900/30 font-mono text-xs text-red-400 break-all leading-relaxed">
                                        {selectedThreat.details}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Globe size={12}/> Red y Origen</h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between"><span className="text-gray-500">Conexión Segura:</span><span className="text-white font-bold">{selectedThreat.network?.secure}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Procedencia:</span><span className="text-white font-bold truncate max-w-[150px]">{selectedThreat.network?.referrer}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Idioma:</span><span className="text-white font-bold">{selectedThreat.browser?.language}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Huella Digital */}
                            <div className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Laptop size={12}/> Huella del Dispositivo</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3"><Monitor size={14} className="text-blue-400" /><span className="text-[10px] text-gray-300 font-bold">{selectedThreat.browser?.platform}</span></div>
                                        <div className="flex items-center gap-3"><Activity size={14} className="text-green-400" /><span className="text-[10px] text-gray-300 font-bold">{selectedThreat.browser?.screen} PX</span></div>
                                        <div className="flex items-center gap-3"><Cpu size={14} className="text-purple-400" /><span className="text-[10px] text-gray-300 font-bold">{selectedThreat.browser?.cores} Núcleos CPU</span></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-2"><Info size={12}/> User Agent</h3>
                                    <p className="text-[9px] text-gray-600 font-bold leading-relaxed break-all">{selectedThreat.browser?.userAgent}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] py-40">
                        <Activity size={48} className="text-gray-800 mb-4 animate-pulse" />
                        <p className="text-gray-600 text-xs font-black uppercase tracking-widest">Selecciona un ataque para ver el informe forense</p>
                    </div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </main>
  )
}