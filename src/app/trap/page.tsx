'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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
      // Standardize payload for Admin Dashboard (fp key)
      const fp = {
        ua: navigator.userAgent,
        lang: navigator.language,
        cores: navigator.hardwareConcurrency || 'N/A',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        memory: (navigator as any).deviceMemory || 'N/A',
        screen: `${window.screen.width}x${window.screen.height}`,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        cookies: navigator.cookieEnabled,
        ref: document.referrer || 'Directo'
      };

      const log = { 
        id, 
        type: 'CRITICAL_HONEYPOT_HIT', 
        time: Date.now(),
        url: window.location.href, // Full URL with Query Params
        geo, // Keep geo for extra info if available
        fp,  // Match Admin expectation
        details: `¡INVASOR CAPTURADO! Proviniencia: ${fp.ref}`
      };

      // 1. Reporte NTFY (Usa URL params para evitar CORS Preflight)
      const ntfyUrl = new URL('https://ntfy.sh/ordasin_security_v10');
      ntfyUrl.searchParams.set('title', '🚨 INVASOR CAPTURADO');
      ntfyUrl.searchParams.set('priority', 'urgent');
      ntfyUrl.searchParams.set('tags', 'skull,fire');

      const promise = fetch(ntfyUrl.toString(), {
        method: 'POST',
        body: JSON.stringify(log),
        headers: { 'Content-Type': 'text/plain' },
        keepalive: true
      });

      toast.promise(promise, {
        loading: 'Enviando reporte forense...',
        success: 'Alerta enviada al Admin',
        error: 'Error de conexión con el servidor de seguridad'
      });

      promise.catch(err => console.error("Error enviando alerta:", err));

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
