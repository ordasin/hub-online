'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrapPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const report = async () => {
      try {
        const Gun = (await import('gun')).default;
        
        // FORZAMOS WEBSOCKETS PUROS (Inbloqueable en incógnito)
        const gun = Gun({
          peers: [
            'https://gun-manhattan.herokuapp.com/gun',
            'https://gun-us.herokuapp.com/gun'
          ],
          webRTC: false, // DESACTIVADO: Evita el bloqueo de incógnito
          localStorage: false,
          radisk: false
        });
        
        const params = new URLSearchParams(window.location.search);
        const log = {
          id: 'TRAP-' + Date.now(),
          type: params.get('cause') || 'SECURITY_BREACH',
          details: params.get('payload') || 'Incognito Attack',
          time: Date.now(),
          path: '/trap',
          userAgent: navigator.userAgent
        };

        // Enviar y marcar como hecho inmediatamente (Fire & Forget)
        gun.get('threat_stream').set(log);
        gun.get('latest_threat_signal').put(log);
        
        // Simular éxito visual tras 2 segundos
        setTimeout(() => setDone(true), 2000);

      } catch (e) {
        console.error("P2P Fail");
      }
    };
    report();
  }, []);

  return (
    <main className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 max-w-lg border-2 border-red-900 p-12 rounded-[3rem] bg-red-900/5 shadow-[0_0_60px_rgba(220,38,38,0.2)]">
        <ShieldAlert size={80} className="mx-auto text-red-600 animate-pulse" />
        <h1 className="text-3xl font-black uppercase">Acceso Denegado</h1>
        <div className="py-2 px-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-500">
          {done ? "Intrusión Registrada" : "Enviando reporte de seguridad..."}
        </div>
      </motion.div>
    </main>
  )
}
