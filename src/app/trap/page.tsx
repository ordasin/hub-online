'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Terminal, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('ESTABLECIENDO CONEXIÓN P2P...')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        
        const params = new URLSearchParams(window.location.search);
        const payload = params.get('payload') ? atob(params.get('payload')!) : 'Unknown';
        
        const id = 'ID-' + Math.random().toString(36).substring(7);
        const log = {
          id,
          type: 'SECURITY_ALERT',
          details: payload,
          time: Date.now(),
          ua: navigator.userAgent
        };

        // Envío masivo al canal unificado
        const timer = setInterval(() => {
          gun.get('ORDASIN_SEC_CORE').get(id).put(log, (ack: any) => {
            if (ack && !ack.err) {
              setSent(true);
              setStatus('ALERTA TRANSMITIDA AL NODO MAESTRO');
              clearInterval(timer);
            }
          });
        }, 1000);

        setTimeout(() => clearInterval(timer), 15000);
      } catch (e) {
        setStatus('FALLO CRÍTICO DE RED');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-lg border border-red-900/50 p-12 bg-red-950/10">
        <ShieldAlert size={60} className="mx-auto animate-pulse" />
        <h1 className="text-2xl font-black tracking-widest">ACCESO DENEGADO</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-red-900/20 py-2 px-4 rounded">
          {sent ? <Wifi size={12} className="text-green-500"/> : <Terminal size={12} className="animate-spin"/>}
          <span className={sent ? 'text-green-400' : 'text-red-400'}>{status}</span>
        </div>
      </motion.div>
    </main>
  )
}
