'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Terminal, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('CONECTANDO CON RED P2P...')
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
        const payload = params.get('payload') || 'Direct access';
        
        const id = 'TRAP-' + Date.now();
        const log = {
          id,
          type: 'SECURITY_BREACH',
          details: payload,
          time: Date.now(),
          ua: navigator.userAgent
        };

        // 1. Envío al stream (para la lista)
        gun.get('ORDASIN_V3_CORE').get(id).put(log);
        
        // 2. Envío a la señal rápida (para el Toast instantáneo)
        gun.get('ORDASIN_QUICK_SIGNAL').put(log, (ack: any) => {
          if (!ack.err) {
            setSent(true);
            setStatus('ALERTA ENTREGADA AL ADMIN');
          }
        });

      } catch (e) {
        setStatus('FALLO DE RED');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-lg border border-red-900/50 p-12 bg-red-950/5">
        <ShieldAlert size={60} className="mx-auto animate-pulse" />
        <h1 className="text-2xl font-black italic">ACCESO RESTRINGIDO</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-red-900/20 py-2 px-4 rounded border border-red-900/30">
          {sent ? <Wifi size={12} className="text-green-500"/> : <Terminal size={12} className="animate-spin"/>}
          <span className={sent ? 'text-green-400' : 'text-red-400 font-bold'}>{status}</span>
        </div>
      </motion.div>
    </main>
  )
}