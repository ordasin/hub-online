'use client'

import { useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  useEffect(() => {
    const report = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const Gun = (await import('gun')).default;
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun']);
        
        const id = 'T-' + Date.now();
        const log = {
          id,
          type: params.get('cause') || 'SCAN',
          details: params.get('payload') || 'Direct access',
          time: Date.now(),
          path: '/trap'
        };

        gun.get('intrusion_logs').get(id).put(log);
        gun.get('latest_threat_signal').put(log);
      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 border-2 border-red-900 p-12 rounded-[3rem]">
        <ShieldAlert size={80} className="mx-auto animate-pulse" />
        <h1 className="text-3xl font-black">ACCESO BLOQUEADO</h1>
        <p className="text-red-400/70 font-bold uppercase text-xs tracking-widest">Tu actividad sospechosa ha sido reportada.</p>
      </motion.div>
    </main>
  )
}
