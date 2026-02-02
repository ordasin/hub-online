'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const FRESH_PEERS = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://peer.wall.org/gun'
];

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = () => {
      // @ts-ignore
      if (!window.Gun) return;
      const gun = window.Gun({ peers: FRESH_PEERS, localStorage: false });
      const id = 'ID' + Math.random().toString(36).substring(7);
      const log = { 
        id: id, 
        type: 'EXT_SECURITY_HIT', 
        time: Date.now(),
        details: 'Intento de acceso automatizado detectado en Honeypot'
      };

      console.log("Intentando reportar a Gun:", log);

      const interval = setInterval(() => {
        gun.get('ORDASIN_FINAL_SHIELD').get(id).put(log, (ack: any) => {
          if (ack && !ack.err) {
            console.log("Reporte enviado con éxito:", ack);
            setSent(true);
            clearInterval(interval);
          } else if (ack && ack.err) {
            console.error("Error de Gun:", ack.err);
          }
        });
      }, 2000);

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem] shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Bloqueo de Red</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span>{sent ? "IDENTIDAD REPORTADA AL HUB" : "SINCRONIZANDO CON NODO MAESTRO..."}</span>
        </div>
      </motion.div>
    </main>
  )
}
