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
      let ipData: any = {};
      
      // Intentamos geolocalización con un timeout rápido
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        ipData = await res.json();
        clearTimeout(timeoutId);
      } catch (e) {
        console.warn("Geo-IP failed, sending partial report...");
      }

      const log = { 
        id: id, 
        type: 'EXT_SECURITY_HIT', 
        time: Date.now(),
        ip: ipData,
        browser: {
          agent: navigator.userAgent,
          lang: navigator.language,
          platform: navigator.platform,
          screen: `${window.screen.width}x${window.screen.height}`,
          referrer: document.referrer || 'Directo / Bot'
        },
        details: ipData.city ? `Ataque desde ${ipData.city}` : 'Intento detectado (IP oculta)'
      };

      // ENVIAR ALERTA NTFY SIEMPRE
      fetch('https://ntfy.sh/ordasin_hub_alerts', {
        method: 'POST',
        body: JSON.stringify(log),
        headers: { 
          'Title': `🚨 INVASIÓN: ${ipData.country_name || 'Desconocido'}`,
          'Priority': 'urgent',
          'Tags': 'shield,skull'
        }
      }).catch(e => console.error("Ntfy failure:", e));

      // Reporte vía Gun (Respaldo)
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (Gun) {
        const gun = Gun({ peers: FRESH_PEERS, localStorage: false });
        gun.get('ORDASIN_FINAL_SHIELD').get(id).put(log);
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