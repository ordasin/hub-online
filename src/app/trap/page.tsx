'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

const PEER_LIST = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.gun.eco/gun',
  'https://gunjs.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://gun-us.herokuapp.com/gun'
];

export default function TrapPage() {
  const [peers, setPeers] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      // Usamos la configuración de máxima compatibilidad
      const gun = Gun({ 
        peers: PEER_LIST, 
        localStorage: false,
        webRTC: false 
      });
      
      gun.on('hi', () => setPeers(p => p + 1));
      
      const id = 'T' + Math.random().toString(36).substring(7);
      const log = { id, type: 'INTRUSION_V5', time: Date.now() };

      // Ráfaga de envío
      const interval = setInterval(() => {
        gun.get('VIGILANCE_V1').get(id).put(log, (ack: any) => {
          if (ack && !ack.err) {
            setSent(true);
            clearInterval(interval);
          }
        });
      }, 1500);

      setTimeout(() => clearInterval(interval), 15000);
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        report();
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Acceso Denegado</h1>
        <div className="space-y-4">
          <div className={`flex items-center justify-center gap-3 px-4 py-2 rounded-full border ${peers > 0 ? 'border-blue-500/50 text-blue-400' : 'border-red-500/50 text-red-500'}`}>
            {peers > 0 ? <Wifi size={14}/> : <WifiOff size={14}/>}
            <span className="text-[10px] font-black uppercase">Nodos: {peers}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
            {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
            <span>{sent ? "AMENAZA REPORTADA" : "EMITIENDO SEÑAL P2P..."}</span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}