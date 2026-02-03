'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function TrapPage() {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // 1. ALERTA INSTANTÁNEA (Sin esperas)
    fetch('https://ntfy.sh/ordasin_hub_903_sec_terminal_v12', {
      method: 'POST',
      body: '🚨 CRITICAL_TRAP_HIT: Alguien ha accedido directamente a la zona prohibida (/trap)',
      headers: {
        'Title': 'TRAP ACCESS',
        'Priority': '5',
        'Tags': 'skull,fire',
        'X-Type': 'TRAP_FAST'
      },
      keepalive: true
    }).catch(() => {});

    const reportDetailed = async () => {
      let geo = {};
      try {
        const res = await fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({}));
        geo = res;
      } catch {}

      const fp = {
        ua: navigator.userAgent.substring(0, 100),
        lang: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform
      };

      // 2. REPORTE FORENSE (Segundo plano)
      fetch('https://ntfy.sh/ordasin_hub_903_sec_terminal_v12', {
        method: 'POST',
        body: `📊 DETALLES: IP: ${(geo as any).ip || 'N/A'} - Ciudad: ${(geo as any).city || 'N/A'} - Sistema: ${fp.platform} - Navegador: ${fp.ua}`,
        headers: {
          'Title': 'TRAP FORENSIC DATA',
          'Priority': '4',
          'Tags': 'mag',
          'X-Type': 'TRAP_DETAILED'
        },
        keepalive: true
      }).catch(() => {});

      // 3. Reporte DISCORD (Ofuscado)
      try {
        const d_b64_base = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3Mv';
        const d_b64_id = 'MTQ2NzgyMDEzNDUzMzE2OTMzMw==';
        const d_b64_tk = 'L2ZMeXFVQnZHb1pKNDlVTmtrZzNpSmd5YTUweHhDeUpxWnlVM3k2VDFYOG9uTnMzUXFKLTlickRxTlRpZWtfZ05MUDIw';
        
        const decode = (s: string) => atob(s);
        const discordUrl = decode(d_b64_base) + decode(d_b64_id) + decode(d_b64_tk);

        const discordData = {
          embeds: [{
            title: "🚨 INVASOR CAPTURADO - TRAP HIT",
            color: 15548997,
            fields: [
              { name: "IP", value: (geo as any).ip || 'N/A', inline: true },
              { name: "Sistema", value: fp.platform, inline: true },
              { name: "URL", value: window.location.href, inline: false }
            ],
            timestamp: new Date().toISOString()
          }]
        };

        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(discordData));
        fetch(discordUrl, { method: 'POST', body: formData, keepalive: true }).catch(() => {});
      } catch {}

      setSent(true);
      toast.success("Análisis forense completado");
    };

    reportDetailed();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6 font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 border-2 border-red-900 p-12 bg-red-950/10 rounded-[3rem] shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Bloqueo de Red</h1>
        <div className="flex items-center justify-center gap-3 text-[10px] bg-white/5 py-2 px-4 rounded-full border border-white/10">
          {sent ? <CheckCircle size={14} className="text-green-500" /> : <RefreshCw size={14} className="animate-spin text-purple-500" />}
          <span>{sent ? "CAPTURA FORENSE FINALIZADA" : "REPORTANDO IDENTIDAD AL HUB..."}</span>
        </div>
      </motion.div>
    </main>
  )
}