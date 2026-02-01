'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

export function SecurityMonitor() {
  useEffect(() => {
    const reportThreat = async (type: string, details: string) => {
      const Gun = (await import('gun')).default;
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      
      gun.get('intrusion_logs').set({
        type,
        details: DOMPurify.sanitize(details),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        time: Date.now(),
        resolution: window.screen.width + 'x' + window.screen.height
      });
    };

    // 1. Detectar Payloads en la URL
    const urlParams = window.location.search;
    const suspiciousPatterns = [
      'script', '<', '>', 'SELECT', 'UNION', 'OR 1=1', '../', 'etc/passwd', 'admin'
    ];
    
    if (suspiciousPatterns.some(pattern => urlParams.toUpperCase().includes(pattern.toUpperCase()))) {
      reportThreat('URL_PAYLOAD_ATTEMPT', urlParams);
    }

    // 2. Detectar apertura de Consola (Heurística básica)
    let devtoolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        reportThreat('DEVTOOLS_INSPECTION', 'Usuario inspeccionando código fuente');
      }
    };

    window.addEventListener('resize', checkDevTools);
    
    // 3. Capturar errores JS que podrían ser causados por inyecciones fallidas
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Unexpected token') || event.message.includes('is not defined')) {
        reportThreat('JS_INJECTION_FAILURE', event.message);
      }
    };
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('resize', checkDevTools);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    /* Honeypot Invisible: Links que solo los bots ven */
    <div className="absolute opacity-0 pointer-events-none -z-50" aria-hidden="true">
      <a href="/admin-login">Private Access</a>
      <a href="/.env">Configuration</a>
      <a href="/config.php">Database Setup</a>
      <a href="/wp-login.php">Management</a>
    </div>
  );
}
