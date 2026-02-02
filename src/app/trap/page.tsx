'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const FRESH_PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'wss://gun-us.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const report = async () => {
      // Captura de Huella Digital básica
      const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cores: navigator.hardwareConcurrency || 'N/A',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        memory: (navigator as any).deviceMemory || 'N/A',
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touch: navigator.maxTouchPoints > 0 ? 'Yes' : 'No',
        referrer: document.referrer || 'Directo'
      };

      const id = 'TRAP_' + Math.random().toString(36).substring(7);
      
      // Intentar obtener IP y Geo antes del reporte (Timeout 2s)
      let geo = {};
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);
        geo = res ? await res.json() : {};
      } catch {}

      const log = { 
        id, 
        type: 'CRITICAL_HONEYPOT_HIT', 
        time: Date.now(),
        geo,
        fingerprint,
        details: `¡INVASOR CAPTURADO! Proviniencia: ${fingerprint.referrer}`
      };

      // 1. Reporte NTFY
      fetch('https://ntfy.sh/ordasin_security_v10', {
        method: 'POST',
        body: JSON.stringify(log),
        headers: { 'Title': '🚨 INVASOR CAPTURADO', 'Priority': 'urgent', 'Tags': 'skull,fire' }
      }).catch(err => console.error("Error enviando alerta:", err));

      // 2. Reporte GUN
      // @ts-expect-error Gun via CDN
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
          <span>{sent ? "IDENTIDAD REPORTADA AL HUB" : "CAPTURA FORENSE EN CURSO..."}</span>
        </div>
      </motion.div>
    </main>
  )
}
