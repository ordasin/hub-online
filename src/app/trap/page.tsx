'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

const GLOBAL_PEERS = [
  'https://relay.gun.eco/gun',
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function TrapPage() {
  const [status, setStatus] = useState('ESTABLECIENDO CONEXIÓN GLOBAL...')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        // Esperar a que la librería cargue desde el CDN
        const checkGun = setInterval(async () => {
          // @ts-ignore
          if (window.Gun) {
            clearInterval(checkGun);
            // @ts-ignore
            const gun = window.Gun({ 
              peers: GLOBAL_PEERS,
              webRTC: false, // CLAVE: Desactivamos WebRTC para que funcione entre diferentes navegadores
              localStorage: false 
            });
            
            const params = new URLSearchParams(window.location.search);
            const forensics = {
              id: 'F-' + Date.now() + '-' + Math.random().toString(36).substring(7),
              type: params.get('cause') || 'EXTERNAL_ATTACK',
              details: params.get('payload') ? atob(params.get('payload')!) : 'Unknown',
              time: Date.now(),
              ua: navigator.userAgent,
              browser: navigator.appName + " (" + navigator.language + ")"
            };

            // Enviar repetidamente hasta recibir confirmación del servidor
            const blast = setInterval(() => {
              gun.get('GLOBAL_SECURITY_V2').get(forensics.id).put(forensics, (ack: any) => {
                if (ack && !ack.err) {
                  setSent(true);
                  setStatus('ALERTA ENTREGADA AL NODO MAESTRO');
                  clearInterval(blast);
                }
              });
              // Señal de aviso rápido
              gun.get('LATEST_GLOBAL_ALERT').put(forensics);
            }, 1000);

            setTimeout(() => clearInterval(blast), 20000);
          }
        }, 500);
      } catch (e) {
        setStatus('ERROR EN RED P2P');
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-xl border-2 border-red-900 p-12 bg-red-950/5 rounded-[3rem] shadow-[0_0_100px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-widest italic">Acceso Bloqueado</h1>
        <div className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${sent ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
          {sent ? <Wifi size={14} /> : <RefreshCw size={14} className="animate-spin" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </div>
      </motion.div>
    </main>
  )
}