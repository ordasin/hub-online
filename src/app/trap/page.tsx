'use client'

import { useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  useEffect(() => {
    const reportToAdmin = async () => {
      // Leer datos de la amenaza de la URL
      const params = new URLSearchParams(window.location.search);
      const cause = params.get('cause') || 'UNKNOWN_SCAN';
      const payload = params.get('payload') || 'No details';

      try {
        const Gun = (await import('gun')).default;
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        
        const threatId = 'trap_' + Date.now();
        const log = {
          id: threatId,
          type: cause,
          details: payload,
          path: '/TRAP_SYSTEM',
          userAgent: navigator.userAgent,
          time: Date.now()
        };

        // Enviar log con confirmación
        gun.get('intrusion_logs').get(threatId).put(log);
        gun.get('latest_threat_signal').put(log);
        
        console.log("Aviso enviado al panel de Admin desde la Trampa.");
      } catch (e) {
        console.error("Error P2P:", e);
      }
    };

    if (typeof window !== 'undefined') reportToAdmin();
  }, [])

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5 shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        <ShieldAlert size={80} className="mx-auto animate-pulse" />
        <h1 className="text-3xl font-black tracking-tighter uppercase">Intrusión Bloqueada</h1>
        <p className="text-red-400/70 text-sm leading-relaxed uppercase font-bold">
          Tu actividad ha sido registrada en la red P2P. <br/>
          El administrador ha sido notificado.
        </p>
        <div className="pt-8 text-[10px] text-red-900 font-black uppercase tracking-[0.5em]">
          Access Revoked
        </div>
      </motion.div>
    </main>
  )
}