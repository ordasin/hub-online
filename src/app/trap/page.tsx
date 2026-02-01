'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Activity, CheckCircle, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        // Restauramos la potencia total: WebRTC + LocalStorage
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        
        const params = new URLSearchParams(window.location.search);
        const log = {
          id: 'TRAP-' + Date.now(),
          type: 'INT_BLOQUEADA',
          details: params.get('q') || 'Intento de Inyección',
          time: Date.now(),
          ua: navigator.userAgent
        };

        // Guardar y disparar alarma
        gun.get('SECURITY_ALERTS').get(log.id).put(log, (ack: any) => {
          if (!ack.err) setDone(true);
        });
        gun.get('LATEST_ALERT').put(log);

      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-950/10 shadow-[0_0_100px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Acceso Revocado</h1>
            <p className="text-red-400/70 font-bold text-xs uppercase tracking-widest">Protocolo de Seguridad Nivel 4</p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400 transition-all">
          {done ? <CheckCircle size={14} className="text-green-500" /> : <Activity size={14} className="animate-bounce text-red-500" />}
          <span>{done ? "Intrusión Reportada al Sistema" : "Identificando Amenaza..."}</span>
        </div>
      </motion.div>
    </main>
  )
}
