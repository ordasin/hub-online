'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const RELAY = 'https://gun-manhattan.herokuapp.com/gun';

export default function TrapPage() {
  const [status, setStatus] = useState('LOCALIZANDO NODO MAESTRO...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun({ peers: [RELAY], localStorage: false });
      
      const params = new URLSearchParams(window.location.search);
      const threatId = 'T-' + Math.random().toString(36).substring(7);
      const log = {
        id: threatId,
        type: params.get('cause') || 'EXTERNAL_INJECTION',
        details: params.get('payload') ? atob(params.get('payload')!) : 'Unknown Attack',
        time: Date.now(),
        browser: navigator.userAgent.split(' ')[0]
      };

      // ENVIAR RÁFAGA DE ALARMA
      const blast = setInterval(() => {
        gun.get('HUB_SECURITY_CORE').get(threatId).put(log, (ack: any) => {
          if (ack && !ack.err) {
            setDone(true);
            setStatus('AMENAZA REPORTADA AL HUB');
            clearInterval(blast);
          }
        });
      }, 1500);

      setTimeout(() => clearInterval(blast), 20000);
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem] shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Acceso Denegado</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {done ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span className={done ? 'text-green-400' : 'text-gray-400'}>{status}</span>
        </div>
      </motion.div>
    </main>
  )
}
