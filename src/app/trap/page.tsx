'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('Conectando con red de seguridad...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        // Relés redundantes
        const gun = Gun({
          peers: [
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gun-us.herokuapp.com/gun'
          ],
          webRTC: false,
          localStorage: false
        });
        
        const params = new URLSearchParams(window.location.search);
        const threatId = 'id' + Date.now();
        const log = {
          id: threatId,
          type: params.get('cause') || 'XSS_ATTACK',
          path: params.get('payload') || 'Unknown',
          time: Date.now(),
          ua: navigator.userAgent
        };

        setStatus('Transmitiendo firma de ataque...');

        // Intentar enviar repetidamente hasta recibir confirmación
        const blast = setInterval(() => {
          gun.get('FINAL_THREAT_STREAM').get(threatId).put(log, (ack: any) => {
            if (ack && !ack.err) {
              setDone(true);
              setStatus('Aviso entregado al Nodo Maestro');
              clearInterval(blast);
            }
          });
          // Señal de pulso rápido
          gun.get('GLOBAL_ALARM').put(log);
        }, 1500);

        // Seguridad: parar a los 30s
        setTimeout(() => clearInterval(blast), 30000);

      } catch (e) {
        setStatus('Fallo en transmision P2P');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <div className="absolute inset-0 bg-red-900/5 animate-pulse pointer-events-none" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-black relative z-10 shadow-[0_0_100px_rgba(220,38,38,0.3)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Acceso Denegado</h1>
        
        <div className="space-y-4">
          <p className="text-red-400/70 text-[10px] font-bold uppercase tracking-[0.3em]">
            Tu dirección IP y User-Agent han sido <br/> propagados en la red descentralizada.
          </p>
          
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${done ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
            {done ? <Wifi size={14} /> : <RefreshCw size={14} className="animate-spin" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}