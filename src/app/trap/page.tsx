'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, Wifi, Globe, Laptop, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('EXTRAYENDO METADATOS...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun']);
        
        const params = new URLSearchParams(window.location.search);
        
        // Análisis Forense del Atacante
        const forensics = {
          id: 'F-' + Date.now(),
          type: params.get('cause') || 'UNKNOWN_SCAN',
          details: params.get('payload') ? atob(params.get('payload')!) : 'Direct Link',
          time: Date.now(),
          browser: {
            name: navigator.appName,
            platform: navigator.platform,
            language: navigator.language,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            cores: navigator.hardwareConcurrency || 'N/A'
          },
          network: {
            secure: window.isSecureContext ? 'YES' : 'NO',
            referrer: document.referrer || 'DIRECT'
          }
        };

        setStatus('TRANSMITIENDO EXPEDIENTE FORENSE...');

        const interval = setInterval(() => {
          gun.get('SECURITY_ALERTS_V2').get(forensics.id).put(forensics, (ack: any) => {
            if (ack && !ack.err) {
              setDone(true);
              setStatus('EXPEDIENTE ENTREGADO AL NODO MAESTRO');
              clearInterval(interval);
            }
          });
          // Señal de aviso rápido para el Toast
          gun.get('LATEST_ALERT_DETAIL').put(forensics);
        }, 1500);

        setTimeout(() => clearInterval(interval), 20000);
      } catch (e) {
        setStatus('ERROR EN PROTOCOLO P2P');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-xl border-2 border-red-900 p-12 bg-red-950/5 rounded-[3rem] shadow-[0_0_100px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-widest">Ataque Interceptado</h1>
            <p className="text-red-400/70 text-[10px] font-bold uppercase tracking-[0.3em]">Forensics Unit: Activa</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
            <div className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${done ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                {done ? <CheckCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
            </div>
        </div>

        <div className="pt-4 grid grid-cols-3 gap-4 opacity-30">
            <div className="flex flex-col items-center gap-1"><Globe size={16}/><span className="text-[8px] font-black">TRACE_IP</span></div>
            <div className="flex flex-col items-center gap-1"><Laptop size={16}/><span className="text-[8px] font-black">DEVICE_ID</span></div>
            <div className="flex flex-col items-center gap-1"><Terminal size={16}/><span className="text-[8px] font-black">LOG_SAVE</span></div>
        </div>
      </motion.div>
    </main>
  )
}
