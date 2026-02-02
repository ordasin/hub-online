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
        
        {/* Escudo de Vigilancia Global: V4 ULTRA SENSITIVITY */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const TOPIC = 'ordasin_security_v10';
            
            const report = (type, details, risk) => {
              console.warn("🛡️ SECURITY ALERT:", type, details);
              var riskVal = risk || 'HIGH';
              // Usamos ntfy con parámetros de prioridad máxima para F12
              var ntfyUrl = 'https://ntfy.sh/' + TOPIC + '?title=' + encodeURIComponent('🚨 ' + type) + '&priority=' + (riskVal === 'CRITICAL' ? '5' : '4') + '&tags=warning,skull';
              
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
              }).catch(function(e) { console.error("WAF Error:", e); });
            };

            // 1. DETECCIÓN AGRESIVA DE F12 Y ATAJOS
            window.addEventListener('keydown', function(e) {
              const isF12 = e.key === 'F12';
              const isInspect = e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C');
              const isViewSource = e.ctrlKey && (e.key === 'u' || e.key === 's');

              if (isF12 || isInspect || isViewSource) {
                report('DEVTOOLS_KEY_TRIGGER', 'Atajo prohibido detectado: ' + (isF12 ? 'F12' : isInspect ? 'INSPECT' : 'VIEW SOURCE'), 'CRITICAL');
              }
            });

            // 2. DETECCIÓN POR TAMAÑO (CONSOLA ABIERTA)
            let devtools = false;
            const checkSize = function() {
              const widthDiff = window.outerWidth - window.innerWidth > 160;
              const heightDiff = window.outerHeight - window.innerHeight > 160;
              if (widthDiff || heightDiff) {
                if (!devtools) {
                  report('DEVTOOLS_OPENED', 'Consola de desarrollador detectada mediante redimensionamiento', 'CRITICAL');
                  devtools = true;
                }
              } else {
                devtools = false;
              }
            };
            setInterval(checkSize, 1000);

            // 3. BLOQUEO Y REPORTE DE CLICK DERECHO
            document.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              report('RIGHT_CLICK_ATTEMPT', 'Intento de abrir menú contextual (Inspeccionar)', 'HIGH');
            });

            // 4. SNIFFER DE ATAQUES
            const ATTACK_VECTORS = [
              { id: 'SQLi', regex: /'|--|union\s+select|select\s+from|benchmark\(|sleep\(/i },
              { id: 'XSS', regex: /<script|<img|<svg|onload=|onerror=|eval\(|javascript:/i },
              { id: 'RCE', regex: /;\s*sh|;\s*bash|\|\s*cmd/i }
            ];

            const checkPayload = (value, source) => {
              if (!value || typeof value !== 'string' || value.length < 3) return false;
              for (var i = 0; i < ATTACK_VECTORS.length; i++) {
                if (ATTACK_VECTORS[i].regex.test(value)) {
                  report('WAF_ATTACK_DETECTED', ATTACK_VECTORS[i].id + ' en ' + source, 'CRITICAL');
                  return true;
                }
              }
              return false;
            };

            checkPayload(window.location.search, 'URL_QUERY');
            
            document.addEventListener('input', function(e) {
              if (e.target.value) checkPayload(e.target.value, 'INPUT_' + (e.target.name || e.target.placeholder || 'UNK'));
            }, { passive: true });

            // 5. HONEYPOTS DE CONSOLA
            Object.defineProperty(window, 'admin_config', { get: function() { report('HONEYPOT', 'window.admin_config', 'CRITICAL'); return "DENIED"; } });
            Object.defineProperty(window, 'debug_mode', { get: function() { report('HONEYPOT', 'window.debug_mode'); return "TRAP_ACTIVE"; } });
          })();
        `}} />
      </body>
    </html>
  );
}