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
          peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
          localStorage: false
        });
        
        const params = new URLSearchParams(window.location.search);
        const data = {
          id: 'T' + Date.now() + Math.random().toString(36).substring(7),
          type: 'TRAP_HIT',
          details: params.get('payload') || 'Attack',
          time: Date.now()
        };

        // Enviar ráfaga agresiva
        let count = 0;
        const blast = setInterval(() => {
          gun.get('CORE_SECURITY_V4').get(data.id).put(data, (ack: any) => {
            if (ack && !ack.err) {
              setSent(true);
              clearInterval(blast);
            }
          });
          count++;
          if (count > 8) clearInterval(blast);
        }, 1000);

      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 rounded-[3rem] bg-red-950/10 shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-tighter">Acceso Bloqueado</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span>{sent ? "AMENAZA REPORTADA AL HUB" : "SINCRONIZANDO CON NODO MAESTRO..."}</span>
        </div>
      </motion.div>
    </main>
  )
}
