'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun({
          peers: ['https://gun-manhattan.herokuapp.com/gun'],
          webRTC: false,
          localStorage: false
        });
        
        const params = new URLSearchParams(window.location.search);
        const log = {
          id: 'T-' + Date.now() + '-' + Math.random().toString(36).substring(7),
          type: 'SECURITY_TRAP',
          details: params.get('payload') || 'Incognito intrusion',
          time: Date.now()
        };

        // Ráfaga agresiva: enviar 10 veces en 5 segundos
        let count = 0;
        const blast = setInterval(() => {
          gun.get('SEC_PULSE_V2').get(log.id).put(log, (ack: any) => {
            if (!ack.err) {
              setSent(true);
              clearInterval(blast);
            }
          });
          count++;
          if (count > 10) clearInterval(blast);
        }, 500);

      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5 shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Intrusión Detectada</h1>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-500">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin" />}
          <span>{sent ? "Identidad Reportada" : "Enviando alerta al Nodo Maestro..."}</span>
        </div>
      </motion.div>
    </main>
  )
}