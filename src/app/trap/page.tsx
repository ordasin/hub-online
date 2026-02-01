'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Activity, CheckCircle, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

// Red de relés globales para intercomunicación entre diferentes navegadores
const GLOBAL_PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://relay.gun.eco/gun'
];

export default function TrapPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun({ peers: GLOBAL_PEERS });
        
        const params = new URLSearchParams(window.location.search);
        const log = {
          id: 'T' + Date.now() + Math.random().toString(36).substring(7),
          type: 'INT_BLOQUEADA',
          details: params.get('q') || 'Intrusión externa',
          time: Date.now(),
          ua: navigator.userAgent
        };

        // Emitir a la red global
        gun.get('SECURITY_ALERTS').get(log.id).put(log, (ack: any) => {
          if (!ack.err) setDone(true);
        });
        
        // Señal de alarma rápida
        gun.get('LATEST_ALERT').put(log);

      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-950/10 shadow-[0_0_100px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Acceso Revocado</h1>
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-400">
          {done ? <CheckCircle size={14} className="text-green-500" /> : <Activity size={14} className="animate-bounce text-red-500" />}
          <span>{done ? "Identidad reportada globalmente" : "Sincronizando con Red Maestra..."}</span>
        </div>
      </motion.div>
    </main>
  )
}