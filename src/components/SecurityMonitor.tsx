'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export function SecurityMonitor() {
  const gunRef = useRef<any>(null);

  useEffect(() => {
    const initSecurity = async () => {
      const Gun = (await import('gun')).default;
      gunRef.current = Gun({ peers: PEERS });
      
      // Comprobar URL inmediatamente después de inicializar
      checkUrl();
    };

    const reportThreat = (type: string, details: string) => {
      if (!gunRef.current) return;

      const threatId = Math.random().toString(36).substring(7);
      const log = {
        id: threatId,
        type,
        details: DOMPurify.sanitize(details),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        time: Date.now()
      };

      console.log("🛡️ REGISTRANDO AMENAZA:", log);

      // Enviamos y esperamos confirmación (ack)
      gunRef.current.get('intrusion_logs').get(threatId).put(log, (ack: any) => {
        if (type === 'URL_ATTACK') {
          // Solo redirigimos cuando Gun confirma que ha procesado el dato
          window.location.href = '/trap';
        }
      });
      
      // Actualizar el nodo de alerta rápida
      gunRef.current.get('latest_threat').put(log);
    };

    const checkUrl = () => {
      try {
        const fullUrl = decodeURIComponent(window.location.href).toUpperCase();
        const suspicious = ['<SCRIPT', 'UNION SELECT', 'OR 1=1', 'ALERT(', 'DROP TABLE', '<IMG'];
        
        if (suspicious.some(pattern => fullUrl.includes(pattern))) {
          reportThreat('URL_ATTACK', window.location.search);
        }
      } catch (e) {
        // En caso de error en decodificación, ignorar
      }
    };

    const checkDev = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        reportThreat('DEVTOOLS', 'Inspección activa');
      }
    };

    initSecurity();
    window.addEventListener('resize', checkDev);
    return () => window.removeEventListener('resize', checkDev);
  }, []);

  return null;
}