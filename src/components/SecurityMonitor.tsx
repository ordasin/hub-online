'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun',
  'https://gun-eu.herokuapp.com/gun'
];

export function SecurityMonitor() {
  useEffect(() => {
    const reportThreat = async (type: string, details: string) => {
      console.log(`⚠️ DETECCIÓN DE SEGURIDAD: ${type}`, details);
      
      const Gun = (await import('gun')).default;
      const gun = Gun({ peers: PEERS });
      
      const threatId = Math.random().toString(36).substring(7);
      const log = {
        id: threatId,
        type,
        details: DOMPurify.sanitize(details),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        time: Date.now()
      };

      // Enviar a la red P2P
      gun.get('intrusion_logs').get(threatId).put(log);
      gun.get('latest_threat').put(log);

      // BLOQUEO ACTIVO: Si es un ataque de URL, expulsamos al usuario
      if (type === 'URL_ATTACK') {
        setTimeout(() => {
          window.location.href = '/trap';
        }, 500);
      }
    };

    // 1. Detección de Payloads en URL
    const url = window.location.href.toUpperCase();
    const suspicious = ['<SCRIPT', 'UNION SELECT', 'OR 1=1', 'ALERT(', 'JAVASCRIPT:', 'DROP TABLE'];
    
    if (suspicious.some(pattern => url.includes(pattern))) {
      reportThreat('URL_ATTACK', window.location.search);
    }

    // 2. Detección de F12 (Consola)
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        reportThreat('DEVTOOLS_SCAN', 'Consola de desarrollador abierta');
      }
    };
    window.addEventListener('resize', checkDevTools);

    return () => window.removeEventListener('resize', checkDevTools);
  }, []);

  return (
    <div className="absolute opacity-0 pointer-events-none -z-50" aria-hidden="true">
      <a href="/wp-admin">Admin decoy</a>
      <a href="/.env">Secrets decoy</a>
    </div>
  );
}
