'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://relay.gun.eco/gun',
  'https://peer.wall.org/gun',
  'https://gunjs.herokuapp.com/gun'
];

export default function TrapPage() {
  const [peers, setPeers] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun({ peers: PEERS, localStorage: false });
      
      gun.on('hi', () => setPeers(p => p + 1));
      
      const id = 'ID' + Math.random().toString(36).substring(7);
      const log = { id, type: 'INTRUSION', time: Date.now() };

      // Envío por ráfaga
      const interval = setInterval(() => {
        gun.get('VIGILANCE_V1').get(id).put(log, (ack: any) => {
          if (ack && !ack.err) {
            setSent(true);
            clearInterval(interval);
          }
        });
      }, 1500);

      setTimeout(() => clearInterval(interval), 20000);
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem] shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase tracking-widest italic">Acceso Denegado</h1>
        <div className="space-y-4">
          <div className={`flex items-center justify-center gap-3 px-4 py-2 rounded-full border ${peers > 0 ? 'border-blue-500/50 text-blue-400' : 'border-red-500/50 text-red-500'}`}>
            {peers > 0 ? <Wifi size={14}/> : <WifiOff size={14}/>}
            <span className="text-[10px] font-black uppercase">Relés detectados: {peers}</span>
          </div>
          <div className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${sent ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
            {sent ? <CheckCircle size={14} /> : <RefreshCw size={14} className="animate-spin" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{sent ? "AMENAZA REPORTADA" : "SINCRONIZANDO..."}</span>
          </div>
        </div>
      </motion.div>
    </main>
  )
}