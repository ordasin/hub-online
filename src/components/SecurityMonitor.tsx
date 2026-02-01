'use client'

import { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'

// Usamos los dos relés más fiables
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export function SecurityMonitor() {
  const gunRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      const Gun = (await import('gun')).default;
      gunRef.current = Gun({ peers: PEERS });
      
      // Ping inicial para despertar la conexión
      gunRef.current.get('p2p_status').put({ last_ping: Date.now() });
      
      checkUrl();
    };

    const reportThreat = (type: string, details: string) => {
      if (!gunRef.current) return;

      const threatId = "threat_" + Date.now();
      const log = {
        id: threatId,
        type,
        details: DOMPurify.sanitize(details),
        path: window.location.pathname,
        time: Date.now()
      };

      // Forzar escritura inmediata
      gunRef.current.get('intrusion_logs').get(threatId).put(log, (ack: any) => {
        console.log("P2P ACK:", ack);
        if (type === 'URL_ATTACK') {
          // Esperar medio segundo extra para asegurar propagación
          setTimeout(() => { window.location.href = '/trap'; }, 800);
        }
      });
      
      gunRef.current.get('latest_threat_signal').put(log);
    };

    const checkUrl = () => {
      try {
        const decoded = decodeURIComponent(window.location.href).toUpperCase();
        if (decoded.includes('<SCRIPT') || decoded.includes('ALERT(') || decoded.includes('OR 1=1')) {
          reportThreat('URL_ATTACK', window.location.search);
        }
      } catch (e) {}
    };

    init();
  }, []);

  return null;
}
