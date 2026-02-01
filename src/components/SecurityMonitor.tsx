'use client'

import { useEffect } from 'react'

export function SecurityMonitor() {
  useEffect(() => {
    const checkThreats = () => {
      const url = decodeURIComponent(window.location.href).toUpperCase();
      const suspicious = ['<SCRIPT', 'ALERT(', 'UNION SELECT', 'OR 1=1', 'DROP TABLE', '<IMG'];
      
      if (suspicious.some(p => url.includes(p))) {
        // Redirección INSTANTÁNEA. Pasamos los datos a la página /trap para que ella informe al admin.
        const details = encodeURIComponent(window.location.search);
        window.location.href = `/trap?cause=INJECTION&payload=${details}`;
      }
    };

    checkThreats();
    window.addEventListener('popstate', checkThreats);
    const interval = setInterval(checkThreats, 2000);

    return () => {
      window.removeEventListener('popstate', checkThreats);
      clearInterval(interval);
    };
  }, []);

  return null;
}
