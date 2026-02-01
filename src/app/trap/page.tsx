'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const PEER_LIST = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = () => {
      // @ts-ignore
      if (!window.Gun) return;
      // @ts-ignore
      const gun = window.Gun({ peers: PEER_LIST, localStorage: false });
      const id = 'ID-' + Math.random().toString(36).substring(7);
      const log = { id, type: 'INTRUSION', time: Date.now() };

      // Envío repetitivo agresivo para asegurar que atraviesa cualquier navegador
      const interval = setInterval(() => {
        gun.get('ORDASIN_V1_SEC').get(id).put(log, (ack: any) => {
          if (ack && !ack.err) {
            setSent(true);
            clearInterval(interval);
          }
        });
      }, 1000);

      setTimeout(() => clearInterval(interval), 15000);
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        report();
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem] shadow-[0_0_60px_rgba(220,38,38,0.3)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Acceso Denegado</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span className={sent ? 'text-green-400 font-bold' : 'text-gray-400 uppercase tracking-widest'}>
            {sent ? "AMENAZA REPORTADA AL HUB" : "TRANSMITIENDO FIRMA DE ATAQUE..."}
          </span>
        </div>
      </motion.div>
    </main>
  )
}