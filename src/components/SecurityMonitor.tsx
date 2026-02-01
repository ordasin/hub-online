'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export function SecurityMonitor() {
  useEffect(() => {
    const reportThreat = async (type: string, details: string) => {
      console.log(`%c[BLOCK] ${type}`, 'color: white; background: red; padding: 5px;', details);
      
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

      // 1. Intentar guardar el log
      gun.get('intrusion_logs').get(threatId).put(log);
      gun.get('latest_threat').put(log);

      // 2. Si es un ataque real, esperamos 1.5 segundos para que el P2P sincronice antes de redirigir
      if (type === 'URL_ATTACK') {
        // Mostramos un mensaje de bloqueo que detiene la ejecución del navegador un momento
        setTimeout(() => {
          window.location.href = '/trap';
        }, 1500);
      }
    };

    const fullUrl = decodeURIComponent(window.location.href).toUpperCase();
    const suspicious = ['<SCRIPT', 'UNION SELECT', 'OR 1=1', 'ALERT(', 'DROP TABLE', '<IMG'];
    
    if (suspicious.some(pattern => fullUrl.includes(pattern))) {
      reportThreat('URL_ATTACK', window.location.search);
    }

    const checkDev = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        reportThreat('DEVTOOLS', 'Inspección de código detectada');
      }
    };
    window.addEventListener('resize', checkDev);
    return () => window.removeEventListener('resize', checkDev);
  }, []);

  return null;
}
