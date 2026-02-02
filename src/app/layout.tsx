import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = { themeColor: "#050505", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: "Ordasin Hub Online | Software de Alto Impacto",
  description: "Ecosistema de software descentralizado y herramientas de vanguardia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <Script 
          src="https://unpkg.com/gun/gun.js" 
          strategy="beforeInteractive"
        />
        <Script 
          src="https://unpkg.com/gun/sea.js" 
          strategy="beforeInteractive"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/nostr-tools@1.17.0/lib/nostr.bundle.min.js" 
          strategy="lazyOnload"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505]`}>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
        <Navbar />
        {children}
        
        {/* Escudo de Vigilancia Global: MAXIMUM SENSITIVITY */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            // --- SISTEMA DE REPORTE ROBUSTO (CORS-PROOF) ---
            const report = (type, details, risk = 'HIGH') => {
              const url = new URL('https://ntfy.sh/ordasin_security_v10');
              url.searchParams.set('title', '🛡️ GLOBAL WAF ALERT');
              url.searchParams.set('priority', risk === 'CRITICAL' ? 'urgent' : 'high');
              url.searchParams.set('tags', 'shield,detective');
              
              const fingerprint = {
                ua: navigator.userAgent,
                lang: navigator.language,
                screen: window.screen.width + 'x' + window.screen.height,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ref: document.referrer,
                platform: navigator.platform,
                cookies: navigator.cookieEnabled,
                cores: navigator.hardwareConcurrency
              };

              const payload = {
                id: 'G_' + Math.random().toString(36).substring(2, 9),
                type,
                time: Date.now(),
                url: window.location.pathname,
                fp: fingerprint, // Max Data
                details
              };

              fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify(payload),
                keepalive: true
              }).catch(e => console.error("WAF Reporting Error:", e));
            };

            // --- 1. DICCIONARIO DE ATAQUES EXTENDIDO ---
            const ATTACK_VECTORS = [
              // SQL Injection
              { id: 'SQLi', regex: /('|"|%27|%22)(?:\\s*)(?:=|or|and|like|is)|(?:\\/\\*|--|#)|union(?:\\s+)select|select(?:\\s+)from|waitfor(?:\\s+)delay|benchmark\\(/i },
              { id: 'SQLi_Adv', regex: /exec(?:\\s+)xp_|sp_executesql|declare(?:\\s+)@|update(?:\\s+)set|delete(?:\\s+)from/i },
              
              // XSS (Cross Site Scripting)
              { id: 'XSS', regex: /<script|<img|<svg|<body|<iframe|javascript:|vbscript:|onload=|onerror=|onmouseover=|onfocus=|eval\\(|setTimeout\\(/i },
              { id: 'XSS_Encoded', regex: /%3Cscript|%3Cimg|%3Csvg|&#x/i },
              
              // Path Traversal / LFI
              { id: 'LFI', regex: /(\\.|%2e){2,}(\\/|%2f|\\\\|%5c)|etc\\/passwd|windows\\/win.ini|boot\\.ini/i },
              
              // Command Injection (RCE)
              { id: 'RCE', regex: /(?:;|\\||\\&|\\$\\()(?:\\s*)(?:sh|bash|cmd|powershell|nc|netcat|curl|wget|ping|whoami|cat|dir|ls|type)/i },
              
              // Prototype Pollution
              { id: 'ProtoPollution', regex: /__proto__|\\.prototype|\\.constructor/i },
              
              // LDAP / XPath / SSI Injection
              { id: 'LDAP_XPath', regex: /\\*\\(|\\)\\(|\\|\\(|\\/node\\(\\)|\\/text\\(\\)|<!--#/i },
              
              // Serialized Object Attacks
              { id: 'Serialization', regex: /O:[0-9]+:"|ro0/i }
            ];

            // --- 2. SNIFFER DE INPUTS (Teclado y Pegado) ---
            const checkPayload = (value, source) => {
              if (!value || value.length < 3) return;
              
              for (const vector of ATTACK_VECTORS) {
                if (vector.regex.test(value)) {
                  report('ATTACK_DETECTED', \`\${vector.id} detected in \${source}: "\${value.substring(0, 50)}..."\`, 'CRITICAL');
                  return; // Report one match per event to avoid spam
                }
              }
            };

            document.addEventListener('input', (e) => {
              if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                checkPayload(e.target.value, e.target.placeholder || e.target.name || 'Input');
              }
            }, { passive: true });

            document.addEventListener('paste', (e) => {
              const paste = (e.clipboardData || window.clipboardData).getData('text');
              checkPayload(paste, 'Clipboard Paste');
            }, { passive: true });

            // --- 3. VIGILANCIA DE ENTORNO ---
            // Detectar DevTools por diferencia de tamaño
            let devtoolsOpen = false;
            const threshold = 160;
            setInterval(() => {
              const widthDiff = window.outerWidth - window.innerWidth > threshold;
              const heightDiff = window.outerHeight - window.innerHeight > threshold;
              
              if ((widthDiff || heightDiff) && !devtoolsOpen) {
                devtoolsOpen = true;
                report('DEVTOOLS_OPENED', 'Consola de desarrollador detectada (Window Resizing)');
              } else if (!widthDiff && !heightDiff) {
                devtoolsOpen = false;
              }
            }, 1000);

            // Detectar Teclas Prohibidas
            window.addEventListener('keydown', (e) => {
              if (e.key === 'F12' || 
                 (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
                 (e.ctrlKey && (e.key === 'u' || e.key === 's'))) {
                report('FORBIDDEN_KEY', \`Intento de acceso a código fuente: \${e.ctrlKey ? 'CTRL+' : ''}\${e.shiftKey ? 'SHIFT+' : ''}\${e.key}\`);
              }
            });

            // --- 4. HONEYPOT DE CONSOLA ---
            // Si el atacante intenta acceder a variables globales "obvias"
            Object.defineProperty(window, 'admin', {
              get: function() {
                report('HONEYPOT_TRIGGERED', 'Intento de acceso a variable global falsa: window.admin', 'CRITICAL');
                return "ACCESS DENIED - LOGGED";
              }
            });
            Object.defineProperty(window, 'debug', {
              get: function() {
                report('HONEYPOT_TRIGGERED', 'Intento de acceso a variable global falsa: window.debug');
                return "DEBUG MODE: TRAP ACTIVE";
              }
            });

          })();
        `}} />
      </body>
    </html>
  );
}