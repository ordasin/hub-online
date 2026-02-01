'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Activity, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [status, setStatus] = useState('INICIANDO PROTOCOLO...')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        // Solo un relé para asegurar coincidencia
        const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
        
        gun.on('hi', () => {
          setConnected(true);
          setStatus('CONECTADO AL NODO MAESTRO');
        });

        const params = new URLSearchParams(window.location.search);
        const payload = params.get('payload') || 'Unknown';
        
        const alertLog = {
          type: 'CRITICAL_INTRUSION',
          details: payload,
          time: Date.now(),
          ua: navigator.userAgent
        };

        // GOLPEAR EL CANAL DE ALARMA (Ráfaga)
        const alarm = setInterval(() => {
          // Escribimos en un nodo fijo para que el Admin lo detecte por .on() instantáneo
          gun.get('HUB_ALARM_SYSTEM').put(alertLog);
          // También lo metemos en el historial
          gun.get('HUB_HISTORY').set(alertLog);
        }, 1000);

        // Auto-limpieza tras 20 segundos
        setTimeout(() => clearInterval(alarm), 20000);

      } catch (e) {
        setStatus('ERROR DE COMUNICACIÓN');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border border-red-900 p-12 bg-red-950/10 shadow-[0_0_80px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={64} className="mx-auto animate-pulse" />
        <h1 className="text-2xl font-black uppercase tracking-widest">Acceso Denegado</h1>
        <div className="flex flex-col gap-2 items-center">
          <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-[10px] border ${connected ? 'border-green-500/50 text-green-500' : 'border-red-500/50 text-red-500'}`}>
            <Wifi size={12}/> {status}
          </div>
          <p className="text-[9px] text-gray-600 uppercase">Tu rastro digital ha sido enviado al administrador.</p>
        </div>
      </motion.div>
    </main>
  )
}