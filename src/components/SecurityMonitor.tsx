'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://gun-us.herokuapp.com/gun'
];

export function SecurityMonitor() {
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    let gun: any = null;

    const init = async () => {
      try {
        const Gun = (await import('gun')).default;
        // Modo RAM pura para evitar bloqueos de incógnito
        gun = Gun({ 
          peers: PEERS,
          indexedDB: false, 
          localStorage: false 
        });
        setStatus('Vigilante Activo');
        
        // Comprobar amenazas inmediatamente
        setTimeout(() => checkThreats(), 1000); 
      } catch (e) {
        setStatus('Security Error');
      }
    };

    const checkThreats = () => {
      if (!gun) return;
      
      const url = decodeURIComponent(window.location.href).toUpperCase();
      const suspicious = ['<SCRIPT', 'ALERT(', 'UNION SELECT', 'OR 1=1', 'DROP TABLE', '<IMG'];
      
      if (suspicious.some(p => url.includes(p))) {
        setStatus('!!! BLOQUEADO !!!');
        
        const threatId = 'threat_' + Date.now();
        const threat = {
          id: threatId,
          type: 'INJECTION_BLOCK',
          path: window.location.search,
          userAgent: navigator.userAgent,
          time: Date.now()
        };

        // 1. Enviamos el log a la red
        gun.get('intrusion_logs').get(threatId).put(threat);
        gun.get('latest_threat_signal').put(threat);
        
        // 2. Esperamos 1.2 segundos para asegurar que los datos salen de la RAM (P2P Sync)
        // y luego expulsamos al intruso
        setTimeout(() => {
          window.location.href = '/trap';
        }, 1200);
      }
    };

    init();
    
    // Vigilancia constante
    window.addEventListener('popstate', checkThreats);
    const interval = setInterval(checkThreats, 3000);

    return () => {
      window.removeEventListener('popstate', checkThreats);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none">
      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-colors ${
        status.includes('!!!') ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-black/50 border-white/10 text-gray-500'
      }`}>
        {status}
      </div>
    </div>
  );
}