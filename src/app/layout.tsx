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
            const report = (type, details, risk) => {
              var riskVal = risk || 'HIGH';
              var url = new URL('https://ntfy.sh/ordasin_security_v10');
              url.searchParams.set('title', '🛡️ GLOBAL WAF ALERT');
              url.searchParams.set('priority', riskVal === 'CRITICAL' ? 'urgent' : 'high');
              url.searchParams.set('tags', 'shield,detective');
              
              var fingerprint = {
                ua: navigator.userAgent.substring(0, 150),
                lang: navigator.language,
                screen: window.screen.width + 'x' + window.screen.height,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ref: document.referrer,
                platform: navigator.platform,
                cookies: navigator.cookieEnabled,
                cores: navigator.hardwareConcurrency
              };

              var payload = {
                id: 'G_' + Math.random().toString(36).substring(2, 9),
                type: type,
                time: Date.now(),
                url: window.location.href,
                fp: fingerprint,
                details: details
              };

              fetch(url.toString(), {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain' },
                keepalive: true
              }).catch(function(e) { console.error("WAF Reporting Error:", e); });
            };

            const ATTACK_VECTORS = [
              { id: 'SQLi', regex: /('|"|%27|%22)(?:\s*)(?:=|or|and|like|is)|(?:\/\*|--|#)|union(?:\s+)select|select(?:\s+)from|waitfor(?:\s+)delay|benchmark\(/i },
              { id: 'SQLi_Adv', regex: /exec(?:\s+)xp_|sp_executesql|declare(?:\s+)@|update(?:\s+)set|delete(?:\s+)from/i },
              { id: 'XSS', regex: /<script|<img|<svg|<body|<iframe|javascript:|vbscript:|onload=|onerror=|onmouseover=|onfocus=|eval\(|setTimeout\(/i },
              { id: 'XSS_Encoded', regex: /%3Cscript|%3Cimg|%3Csvg|&#x/i },
              { id: 'LFI', regex: /(\.|%2e){2,}(\/|%2f|\\|%5c)|etc\/passwd|windows\/win.ini|boot\.ini/i },
              { id: 'RCE', regex: /(?:;|\||\&|\$\()(?:\s*)(?:sh|bash|cmd|powershell|nc|netcat|curl|wget|ping|whoami|cat|dir|ls|type)/i },
              { id: 'ProtoPollution', regex: /__proto__|\.prototype|\.constructor/i },
              { id: 'LDAP_XPath', regex: /\*\(|\)\(|\|\(|\/node\(\)|\/text\(\)|<!--#/i }
            ];

            const checkPayload = (value, source) => {
              if (!value || value.length < 3) return false;
              for (var i = 0; i < ATTACK_VECTORS.length; i++) {
                var vector = ATTACK_VECTORS[i];
                if (vector.regex.test(value)) {
                  report('ATTACK_DETECTED', vector.id + ' in ' + source + ': "' + value.substring(0, 50) + '..."', 'CRITICAL');
                  return true;
                }
              }
              return false;
            };

            checkPayload(window.location.search, 'URL Query');
            checkPayload(window.location.hash, 'URL Hash');

            document.addEventListener('input', function(e) {
              if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                checkPayload(e.target.value, e.target.placeholder || e.target.name || 'Input');
              }
            }, { passive: true });

            document.addEventListener('paste', function(e) {
              var paste = (e.clipboardData || window.clipboardData).getData('text');
              checkPayload(paste, 'Clipboard Paste');
            }, { passive: true });

            let devtoolsOpen = false;
            const threshold = 160;
            setInterval(function() {
              var widthDiff = window.outerWidth - window.innerWidth > threshold;
              var heightDiff = window.outerHeight - window.innerHeight > threshold;
              if ((widthDiff || heightDiff) && !devtoolsOpen) {
                devtoolsOpen = true;
                report('DEVTOOLS_OPENED', 'Consola detectada');
              } else if (!widthDiff && !heightDiff) {
                devtoolsOpen = false;
              }
            }, 1500);

            window.addEventListener('keydown', function(e) {
              if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && (e.key === 'u' || e.key === 's'))) {
                report('FORBIDDEN_KEY', 'Acceso fuente: ' + e.key);
              }
            });

            Object.defineProperty(window, 'admin', { get: function() { report('HONEYPOT', 'window.admin', 'CRITICAL'); return "DENIED"; } });
            Object.defineProperty(window, 'debug', { get: function() { report('HONEYPOT', 'window.debug'); return "TRAP"; } });
          })();
        `}} />
      </body>
    </html>
  );
}