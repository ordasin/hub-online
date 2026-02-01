'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export function SecurityMonitor() {
  useEffect(() => {
    const reportThreat = async (type: string, details: string) => {
      console.log(`%c⚠️ SEGURIDAD: ${type}`, 'color: red; font-weight: bold;', details);
      
      try {
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

        gun.get('intrusion_logs').get(threatId).put(log);
        gun.get('latest_threat').put(log);
      } catch (e) {
        console.error("Error enviando log P2P", e);
      }

      if (type === 'URL_ATTACK') {
        alert("INTENTO DE INYECCIÓN DETECTADO - SESIÓN BLOQUEADA");
        window.location.href = '/trap';
      }
    };

    // Detectar patrones sospechosos decodificando la URL
    const fullUrl = decodeURIComponent(window.location.href).toUpperCase();
    const suspicious = ['<SCRIPT', 'UNION SELECT', 'OR 1=1', 'ALERT(', 'DROP TABLE', '<IMG'];
    
    if (suspicious.some(pattern => fullUrl.includes(pattern))) {
      reportThreat('URL_ATTACK', window.location.search);
    }

    // Detección de F12 (Consola)
    const checkDev = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        reportThreat('DEVTOOLS', 'Consola detectada');
      }
    };
    window.addEventListener('resize', checkDev);
    return () => window.removeEventListener('resize', checkDev);
  }, []);

  return null;
}