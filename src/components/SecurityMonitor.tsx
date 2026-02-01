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
        gun = Gun({ peers: PEERS });
        setStatus('Vigilante Activo');
        
        // Comprobación inicial y cada vez que cambia la URL
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
          id: 'auto_' + Date.now(),
          type: 'INJECTION_ATTEMPT',
          path: window.location.search,
          userAgent: navigator.userAgent,
          time: Date.now()
        };

        // Guardar en P2P
        gun.get('intrusion_logs').get(threat.id).put(threat);
        gun.get('latest_threat_signal').put(threat);
        
        // Guardar localmente para debug
        localStorage.setItem('last_detected_threat', JSON.stringify(threat));
        
        setStatus('!!! AMENAZA DETECTADA !!!');
        console.warn("DEFENSA ACTIVA: Ataque detectado y reportado a la red.");
      }
    };

    init();
    
    // Vigilar cambios de URL sin recargar (navegación Next.js)
    window.addEventListener('popstate', checkThreats);
    const interval = setInterval(checkThreats, 3000); // Doble comprobación

    return () => {
      window.removeEventListener('popstate', checkThreats);
      clearInterval(interval);
    };
  }, []);

  // Pequeño indicador de seguridad en la esquina inferior izquierda (solo para desarrollo/test)
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