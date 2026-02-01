'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

const PEERS = ['https://gun-manhattan.herokuapp.com/gun'];

export function SecurityMonitor() {
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    let gun: any = null;

    const init = async () => {
      try {
        const Gun = (await import('gun')).default;
        // Configuramos Gun para que NO use IndexedDB (evita bloqueos de incógnito)
        gun = Gun({ 
          peers: PEERS,
          indexedDB: false, 
          localStorage: false 
        });
        setStatus('Vigilante Activo');
        checkThreats();
      } catch (e) {
        setStatus('Error de Carga');
      }
    };

    const checkThreats = () => {
      if (!gun) return;
      
      const url = decodeURIComponent(window.location.href).toUpperCase();
      const suspicious = ['<SCRIPT', 'ALERT(', 'UNION SELECT', 'OR 1=1', 'DROP TABLE'];
      
      if (suspicious.some(p => url.includes(p))) {
        const threat = {
          id: 'incog_' + Date.now() + '_' + Math.random().toString(36).substring(7),
          type: 'SEC_VIOLATION',
          path: window.location.search,
          userAgent: navigator.userAgent,
          time: Date.now()
        };

        // Enviar aviso rápido
        gun.get('intrusion_logs').get(threat.id).put(threat);
        gun.get('latest_threat_signal').put(threat);
        
        setStatus('!!! AMENAZA DETECTADA !!!');
        console.warn("INCÓGNITO DETECTADO Y REPORTADO");
      }
    };

    init();
    window.addEventListener('popstate', checkThreats);
    const interval = setInterval(checkThreats, 5000);

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
