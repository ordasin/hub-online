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
        
        {/* Escudo de Vigilancia Global: V3 ROBUST */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const TOPIC = 'ordasin_security_v10';
            
            const report = (type, details, risk) => {
              console.warn("🛡️ WAF ALERT TRIGGERED:", type, details);
              var riskVal = risk || 'HIGH';
              var ntfyUrl = 'https://ntfy.sh/' + TOPIC + '?title=' + encodeURIComponent('🛡️ WAF: ' + type) + '&priority=' + (riskVal === 'CRITICAL' ? '5' : '4') + '&tags=shield,detective';
              
              var payload = {
                id: 'G_' + Math.random().toString(36).substring(2, 9),
                type: type,
                time: Date.now(),
                url: window.location.href,
                fp: {
                  ua: navigator.userAgent.substring(0, 100),
                  lang: navigator.language,
                  screen: window.screen.width + 'x' + window.screen.height,
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  platform: navigator.platform,
                  cores: navigator.hardwareConcurrency
                },
                details: details
              };

              fetch(ntfyUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain' },
                keepalive: true
              }).catch(function(e) { console.error("WAF Fetch Error:", e); });
            };

            const ATTACK_VECTORS = [
              { id: 'SQLi', regex: /'|--|union\s+select|select\s+from|benchmark\(|sleep\(/i },
              { id: 'XSS', regex: /<script|<img|<svg|onload=|onerror=|eval\(|javascript:/i },
              { id: 'LFI', regex: /\.\.\/|\.\\|etc\/passwd/i },
              { id: 'RCE', regex: /;\s*sh|;\s*bash|\|\s*cmd/i }
            ];

            const checkPayload = (value, source) => {
              if (!value || typeof value !== 'string' || value.length < 3) return false;
              for (var i = 0; i < ATTACK_VECTORS.length; i++) {
                if (ATTACK_VECTORS[i].regex.test(value)) {
                  report('ATTACK_DETECTED', ATTACK_VECTORS[i].id + ' in ' + source + ': ' + value.substring(0, 30), 'CRITICAL');
                  return true;
                }
              }
              return false;
            };

            // Escaneo Inicial
            checkPayload(window.location.search, 'URL_QUERY');
            checkPayload(window.location.hash, 'URL_HASH');

            // Listeners
            document.addEventListener('input', function(e) {
              if (e.target.value) checkPayload(e.target.value, 'INPUT_' + (e.target.name || e.target.placeholder || 'UNK'));
            }, { passive: true });

            // DevTools Detection (Legacy but working)
            let devtools = false;
            setInterval(function() {
              if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                if (!devtools) { report('DEVTOOLS', 'Consola abierta'); devtools = true; }
              } else { devtools = false; }
            }, 2000);

            // Honeypots
            Object.defineProperty(window, 'admin_panel', { get: function() { report('HONEYPOT', 'window.admin_panel'); return "ACCESS_DENIED"; } });
          })();
        `}} />
      </body>
    </html>
  );
}
