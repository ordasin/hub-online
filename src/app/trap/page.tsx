'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const FRESH_PEERS = [
  'wss://gun.v6.rocks/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

const NOSTR_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social'
];

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      const id = 'ID' + Math.random().toString(36).substring(7);
      const log = { 
        id: id, 
        type: 'EXT_SECURITY_HIT', 
        time: Date.now(),
        details: 'Intento de acceso detectado vía Nostr P2P'
      };

      // 1. Reporte vía Gun (Como respaldo)
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (Gun) {
        const gun = Gun({ peers: FRESH_PEERS, localStorage: false });
        gun.get('ORDASIN_FINAL_SHIELD').get(id).put(log);
      }

      // 2. Reporte vía Nostr (Principal y ultra-fiable)
      try {
        NOSTR_RELAYS.forEach(url => {
          const ws = new WebSocket(url);
          ws.onopen = () => {
            // Enviamos un evento anónimo de tipo "Aviso de Seguridad"
            const event = {
              kind: 1,
              created_at: Math.floor(Date.now() / 1000),
              tags: [['t', 'ordasin_security_alert']],
              content: JSON.stringify(log),
              pubkey: '0000000000000000000000000000000000000000000000000000000000000000', // Pubkey genérica para bots
              id: id.padEnd(64, '0'),
              sig: '0000000000000000000000000000000000000000000000000000000000000000'
            };
            ws.send(JSON.stringify(['EVENT', event]));
            setTimeout(() => ws.close(), 2000);
          };
        });
      } catch (e) {
        console.error("Nostr failure:", e);
      }

      setTimeout(() => setSent(true), 2000);
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