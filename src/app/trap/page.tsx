'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('Sincronizando con Red de Seguridad...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const Gun = (await import('gun')).default;
        const gun = Gun({
          peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
          localStorage: false
        });
        
        const log = {
          type: params.get('cause') || 'INJECTION',
          details: params.get('payload') || 'Incognito Attempt',
          time: Date.now(),
          userAgent: navigator.userAgent,
          path: '/trap'
        };

        // Usamos .set() para añadir a una lista, garantizando que cada entrada es única
        gun.get('threat_stream').set(log, (ack: any) => {
          if (!ack.err) {
            setStatus('Intrusión registrada exitosamente');
            setDone(true);
          }
        });

      } catch (e) {
        setStatus('Error de conexión P2P');
      }
    };
    if (typeof window !== 'undefined') report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5 shadow-[0_0_60px_rgba(220,38,38,0.15)]">
        <ShieldAlert size={80} className="mx-auto animate-pulse text-red-600" />
        <h1 className="text-3xl font-black tracking-tighter uppercase">Conexión Bloqueada</h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {done ? <CheckCircle size={12} className="text-green-500" /> : <RefreshCw size={12} className="animate-spin" />}
          {status}
        </div>
      </motion.div>
    </main>
  )
}
