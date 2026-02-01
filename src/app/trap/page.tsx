'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('CONECTANDO...')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun({
          peers: ['https://gun-manhattan.herokuapp.com/gun', 'https://gun-us.herokuapp.com/gun'],
          webRTC: false, // Desactivar para evitar bloqueos
          localStorage: false
        });
        
        const params = new URLSearchParams(window.location.search);
        const alertData = {
          type: 'INTRUSION',
          details: params.get('payload') || 'Security Trigger',
          time: Date.now(),
          id: Math.random().toString(36).substring(7)
        };

        // Bucle de ráfaga: enviar cada segundo hasta recibir confirmación
        const interval = setInterval(() => {
          gun.get('SECURITY_CHANNEL_V1').set(alertData, (ack: any) => {
            if (ack && !ack.err) {
              setSent(true);
              setStatus('ALERTA ENVIADA AL ADMIN');
              clearInterval(interval);
            }
          });
        }, 1000);

        setTimeout(() => clearInterval(interval), 15000);
      } catch (e) {
        setStatus('ERROR P2P');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-lg border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem]">
        <ShieldAlert size={60} className="mx-auto animate-pulse" />
        <h1 className="text-2xl font-black italic uppercase">Acceso Bloqueado</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <Wifi size={12} className="text-green-500"/> : <WifiOff size={12} className="text-red-500 animate-bounce"/>}
          <span className={sent ? 'text-green-400' : 'text-gray-400'}>{status}</span>
        </div>
      </motion.div>
    </main>
  )
}
