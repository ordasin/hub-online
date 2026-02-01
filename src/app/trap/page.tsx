'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [peers, setPeers] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        const gun = Gun({
          peers: ['https://gun-manhattan.herokuapp.com/gun'],
          localStorage: false
        });

        // Monitor de conexión
        gun.on('hi', () => setPeers(prev => prev + 1));
        gun.on('bye', () => setPeers(prev => Math.max(0, prev - 1)));
        
        const params = new URLSearchParams(window.location.search);
        const log = {
          type: 'INTRUSION',
          details: params.get('payload') || 'Attack Detected',
          time: Date.now()
        };

        // Generar ID simple
        const id = 'T' + Math.floor(Math.random() * 1000000);

        // Envío repetitivo hasta que haya éxito
        const timer = setInterval(() => {
          gun.get('CORE_SECURITY_V4').get(id).put(log, (ack: any) => {
            if (ack && !ack.err) {
              setSent(true);
              clearInterval(timer);
            }
          });
        }, 2000);

        setTimeout(() => clearInterval(timer), 20000);
      } catch (e) {}
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-950/10">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-2xl font-black uppercase">Seguridad Activa</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
            {peers > 0 ? <Wifi size={12} className="text-blue-400"/> : <WifiOff size={12} className="text-red-500"/>}
            <span className="text-gray-400 uppercase">Servidores P2P detectados: {peers}</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
            {sent ? <CheckCircle size={12} className="text-green-500" /> : <RefreshCw size={12} className="animate-spin text-purple-500" />}
            <span className={sent ? 'text-green-400' : 'text-gray-400'}>
              {sent ? "ALERTA ENTREGADA AL NODO MAESTRO" : "TRANSMITIENDO FIRMA DE ATAQUE..."}
            </span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}