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
  title: "HUB 903 | Descargar Software de Alto Impacto y Herramientas P2P",
  description: "Explora HUB 903, el ecosistema líder en software descentralizado. Descarga herramientas de alto impacto, scripts Python avanzados y experimenta la red P2P en tiempo real.",
  keywords: ["descargar software", "alto impacto", "herramientas P2P", "scripts python", "software descentralizado", "developer 903", "ordasin hub"],
  authors: [{ name: "Ordasin Hub" }],
  metadataBase: new URL('https://developer903.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: "HUB 903 | Software de Alto Impacto",
    description: "Ecosistema de herramientas avanzadas y red descentralizada.",
    url: 'https://developer903.com',
    siteName: 'HUB 903',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HUB 903 | Software de Alto Impacto',
    description: 'Descarga herramientas avanzadas y scripts Python.',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
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
        {/* JSON-LD para Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HUB 903",
              "operatingSystem": "Windows, Linux, Python",
              "applicationCategory": "DeveloperApplication",
              "description": "Ecosistema de software de alto impacto y herramientas descentralizadas.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505]`}>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
        <Navbar />
        {children}
        
        {/* Escudo de Vigilancia Global: V6 HYPER-AGRESSIVE */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var TOPIC = 'ordasin_hub_903_sec_terminal_v12';
            
            const report = (type, details, risk) => {
              var riskVal = risk || 'HIGH';
              fetch('https://ntfy.sh/' + TOPIC, {
                method: 'POST',
                body: '🚨 [' + type + ']: ' + details,
                headers: { 
                  'Title': 'HUB 903 SECURITY',
                  'Priority': riskVal === 'CRITICAL' ? '5' : '4',
                  'Tags': 'warning,skull',
                  'X-Type': type,
                  'X-URL': window.location.href
                },
                keepalive: true
              }).catch(function() {});

              // 2. Reporte DISCORD (Uso de FormData para evitar Preflight CORS)
              const discordData = {
                embeds: [{
                  title: "🛡️ WAF ALERT - " + type,
                  color: riskVal === 'CRITICAL' ? 15548997 : 3447003,
                  fields: [
                    { name: "Detalles", value: details, inline: false },
                    { name: "URL", value: window.location.href, inline: false },
                    { name: "Plataforma", value: fingerprint.platform, inline: true },
                    { name: "Pantalla", value: fingerprint.screen, inline: true }
                  ],
                  footer: { text: "HUB 903 | Vigilancia Global" },
                  timestamp: new Date().toISOString()
                }]
              };

              const formData = new FormData();
              formData.append('payload_json', JSON.stringify(discordData));

              fetch(discordUrl, {
                method: 'POST',
                body: formData,
                keepalive: true
              }).catch(function() {});
            };

            // 1. Detección por Debugger (El método más letal)
            // Si la consola está abierta, el debugger pausa el hilo y el tiempo vuela.
            setInterval(function() {
              var startTime = performance.now();
              debugger;
              var endTime = performance.now();
              if (endTime - startTime > 100) {
                report('DEVTOOLS_ACTIVE_DEBUGGER', 'Consola abierta detectada por latencia de ejecución', 'CRITICAL');
              }
            }, 2000);

            // 2. Detección por Clic Derecho (Intento de Inspección)
            window.addEventListener('contextmenu', function(e) {
              report('CONTEXT_MENU_OPEN', 'Intento de inspección vía menú contextual (clic derecho)');
            });

            // 3. Bloqueo de Atajos y F12
            window.addEventListener('keydown', function(e) {
              if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) {
                report('HACK_SHORTCUT_PRESSED', 'Atajo de teclado de inspección detectado: ' + e.code, 'CRITICAL');
              }
            });

            // 4. Detección de Rutas Prohibidas
            var forbidden = ['backup', 'config', 'secret', 'database', 'env', 'setup', 'wp-admin', 'phpmyadmin', 'root'];
            var path = window.location.pathname.toLowerCase();
            if (forbidden.some(function(p) { return path.indexOf(p) !== -1; })) {
               report('SENSITIVE_PATH_HIT', 'Escaneo de directorio: ' + path, 'CRITICAL');
            }

            // 5. Detección de Hacking Tools via UserAgent
            var ua = navigator.userAgent.toLowerCase();
            var tools = ['sqlmap', 'nmap', 'nikto', 'burpsuite', 'python-requests', 'node-fetch', 'go-http-client', 'curl/', 'wget', 'headless', 'puppeteer', 'selenium'];
            if (tools.some(function(t) { return ua.indexOf(t) !== -1; })) {
              report('MALICIOUS_USER_AGENT', 'Herramienta automatizada: ' + navigator.userAgent, 'CRITICAL');
              window.location.href = '/trap';
            }

            // Honeypots globales
            Object.defineProperty(window, 'admin_panel', { get: function() { report('HONEYPOT_ACCESS', 'window.admin_panel'); return "UNAUTHORIZED"; } });

            // 6. Análisis de Parámetros de URL (WAF de URL)
            var query = window.location.search.toLowerCase();
            var attackPatterns = [
              '<script', 'alert(', 'onerror=', 'eval(', 'union select', 'or 1=1', 'drop table', '../', '/etc/passwd'
            ];
            if (attackPatterns.some(function(p) { return query.indexOf(p) !== -1; })) {
              report('MALICIOUS_QUERY_STRING', 'Payload detectado en URL: ' + window.location.search, 'CRITICAL');
            }
          })();
        `}} />
      </body>
    </html>
  );
}
