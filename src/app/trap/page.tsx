'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun'
];

export default function TrapPage() {
  const [status, setStatus] = useState('Sincronizando con Red de Seguridad...')
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const report = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const Gun = (await import('gun')).default;
        const gun = Gun({
          peers: PEERS,
          localStorage: false,
          retry: 1000
        });
        
        const threatId = 'T' + Date.now();
        const log = {
          id: threatId,
          type: params.get('cause') || 'INJECTION',
          details: params.get('payload') || 'Incognito Access',
          time: Date.now(),
          userAgent: navigator.userAgent
        };

        // 1. Envío por canal de historial
        gun.get('threat_stream').get(threatId).put(log, (ack: any) => {
          if (!ack.err) {
            setStatus('Intrusión registrada exitosamente');
            setDone(true);
            clearTimeout(timeout);
          }
        });

        // 2. Envío por canal de alerta rápida (sin esperar confirmación)
        gun.get('latest_threat_signal').put(log);

        // 3. Timeout optimista: Si a los 7 segundos no hay confirmación, 
        // lo damos por enviado porque GunDB es muy persistente de fondo
        timeout = setTimeout(() => {
          if (!done) {
            setStatus('Señal enviada a la red (Modo Incógnito)');
            setDone(true);
          }
        }, 7000);

      } catch (e) {
        setError(true);
        setStatus('Error en protocolo P2P');
      }
    };

    if (typeof window !== 'undefined') report();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5 shadow-[0_0_60px_rgba(220,38,38,0.15)]">
        <ShieldAlert size={80} className={`mx-auto ${done ? '' : 'animate-pulse'} text-red-600`} />
        <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase">Conexión Denegada</h1>
            <p className="text-[10px] text-red-900 font-black tracking-[0.3em]">Protocolo Honeypot Activo</p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {done ? (
            <CheckCircle size={12} className="text-green-500" />
          ) : error ? (
            <WifiOff size={12} className="text-red-500" />
          ) : (
            <RefreshCw size={12} className="animate-spin text-purple-500" />
          )}
          {status}
        </div>

        <div className="pt-4 opacity-20 text-[8px] uppercase font-bold text-gray-500">
            Node ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </motion.div>
    </main>
  )
}