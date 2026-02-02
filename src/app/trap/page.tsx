'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const FRESH_PEERS = [
  'wss://gun.v6.rocks/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun) return;
      
      const gun = Gun({ peers: FRESH_PEERS, localStorage: false });
      const id = 'ID' + Math.random().toString(36).substring(7);
      const log = { 
        id: id, 
        type: 'EXT_SECURITY_HIT', 
        time: Date.now(),
        details: 'Intento de acceso automatizado detectado en Honeypot'
      };

      console.log("Iniciando reporte único a Gun...");

      // Enviamos el payload UNA SOLA VEZ. Gun se encarga de sincronizarlo cuando conecte.
      gun.get('ORDASIN_FINAL_SHIELD').get(id).put(log, (ack: { err: any }) => {
        if (ack && !ack.err) {
          console.log("Confirmación recibida del nodo:", ack);
          setSent(true);
        } else if (ack && ack.err) {
          console.error("Error en el nodo:", ack.err);
        }
      });

      // Si después de 10 segundos no hay ack, mostramos éxito visual de todos modos 
      // para no frustrar al usuario/bot, aunque Gun seguirá intentándolo en el fondo.
      setTimeout(() => {
        setSent(true);
      }, 10000);
    };

    const check = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
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
        <h1 className="text-3xl font-black uppercase">Bloqueo de Red</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span>{sent ? "IDENTIDAD REPORTADA AL HUB" : "SINCRONIZANDO CON NODO MAESTRO..."}</span>
        </div>
      </motion.div>
    </main>
  )
}
