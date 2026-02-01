'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('Reportando intrusión...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const Gun = (await import('gun')).default;
        // Forzamos modo sin disco para evitar bloqueos de incógnito
        const gun = Gun({
          peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
          localStorage: false,
          indexedDB: false
        });
        
        const id = 'T-' + Date.now() + '-' + Math.random().toString(36).substring(7);
        const log = {
          id,
          type: params.get('cause') || 'INC_INJECTION',
          details: params.get('payload') || 'Incognito Attack',
          time: Date.now(),
          path: '/trap'
        };

        // Bucle de envío agresivo
        const interval = setInterval(() => {
          gun.get('intrusion_logs').get(id).put(log, (ack: any) => {
            if (!ack.err) {
              setStatus('Intrusión registrada en la red P2P');
              setDone(true);
              clearInterval(interval);
            }
          });
          gun.get('latest_threat_signal').put(log);
        }, 2000);

        // Limpiar a los 20 segundos por si acaso
        setTimeout(() => clearInterval(interval), 20000);

      } catch (e) {
        setStatus('Error de conexión P2P');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5">
        <ShieldAlert size={80} className="mx-auto animate-pulse text-red-600" />
        <h1 className="text-3xl font-black tracking-tighter uppercase">Acceso Revocado</h1>
        
        <div className="space-y-4">
          <p className="text-red-400/70 text-sm font-bold uppercase tracking-widest leading-relaxed">
            Se ha detectado un intento de inyección de código. <br/> Tu identidad ha sido marcada.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            {done ? <CheckCircle size={12} className="text-green-500" /> : <RefreshCw size={12} className="animate-spin" />}
            {status}
          </div>
        </div>

        <div className="pt-8 text-[10px] text-red-900 font-black uppercase tracking-[0.5em]">
          Master Admin Notified
        </div>
      </motion.div>
    </main>
  )
}