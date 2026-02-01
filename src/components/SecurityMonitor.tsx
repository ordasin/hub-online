'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

export function SecurityMonitor() {
  useEffect(() => {
    const reportThreat = async (type: string, details: string) => {
      const Gun = (await import('gun')).default;
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      
      const threatId = Math.random().toString(36).substring(7);
      const log = {
        id: threatId,
        type,
        details: DOMPurify.sanitize(details),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        time: Date.now()
      };

      // Guardar en una lista global de amenazas
      gun.get('intrusion_logs').get(threatId).put(log);
      
      // También guardar bajo un nodo único para que el Admin reciba la señal
      gun.get('latest_threat').put(log);
    };

    const urlParams = window.location.search;
    if (urlParams && (urlParams.includes('<') || urlParams.includes('script') || urlParams.includes('SELECT'))) {
      reportThreat('URL_ATTACK', urlParams);
    }

    // Detección de F12 / Consola
    let lastChange = Date.now();
    const checkDev = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        if (Date.now() - lastChange > 2000) { // Evitar spam
          reportThreat('DEVTOOLS', 'Consola detectada');
          lastChange = Date.now();
        }
      }
    };
    window.addEventListener('resize', checkDev);

    return () => window.removeEventListener('resize', checkDev);
  }, []);

  return (
    <div className="absolute opacity-0 pointer-events-none -z-50">
      <a href="/admin-panel">Honeypot 1</a>
      <a href="/.env">Honeypot 2</a>
    </div>
  );
}