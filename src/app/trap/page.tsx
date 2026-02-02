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
      const startTime = Date.now();
      
      // 1. ALERTA INSTANTÁNEA (Sin esperar a nadie)
      const quickLog = { id, type: 'EXT_SECURITY_HIT', time: startTime, details: 'Invasión detectada (Sincronizando info forense...)' };
      
      const sendNtfy = (data: any) => {
        fetch('https://ntfy.sh/ordasin_security_6mwMzG', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Title': '🚨 ALERTA DE SEGURIDAD', 'Priority': 'urgent', 'Tags': 'shield,skull' }
        }).catch(() => {});
      };

      sendNtfy(quickLog); // Enviamos el primer aviso ya.

      // 2. OBTENER INFO FORENSE EN SEGUNDO PLANO
      try {
        const res = await fetch('https://ipapi.co/json/').catch(() => null);
        const ipData = res ? await res.json() : {};
        
        const fullLog = {
          ...quickLog,
          ip: ipData,
          browser: {
            agent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Directo'
          },
          details: `Ataque confirmado desde ${ipData.city || 'Ubicación oculta'}`
        };

        // Enviamos la actualización con todo el peritaje
        sendNtfy(fullLog);

        // 3. RESPALDO EN GUN
        // @ts-expect-error Gun is loaded via CDN
        const Gun = window.Gun;
        if (Gun) {
          const gun = Gun({ peers: FRESH_PEERS, localStorage: false });
          gun.get('ORDASIN_FINAL_SHIELD').get(id).put(fullLog);
        }
      } catch (e) {
        console.error("Forensic error:", e);
      }

      setSent(true);
    };

    report();
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