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
  title: "HUB 903 | Global P2P Software Hub - FPS Boost & PC Optimization",
  description: "The world's leading decentralized software ecosystem. Download Ordasin Optimizer, FPS boosters, and high-impact tools. Join the global P2P network for maximum PC performance.",
  keywords: ["fps boost", "windows optimization", "system cleaner", "subir fps fortnite", "pc optimizer 2026", "p2p software distribution", "low latency tools", "gaming tweaks"],
  authors: [{ name: "Ordasin Hub" }],
  metadataBase: new URL('https://developer903.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: "HUB 903 | Potencia tu PC al Máximo",
    description: "Herramientas de élite para optimización de sistemas y juegos. Únete a la red P2P.",
    url: 'https://developer903.com',
    siteName: 'HUB 903',
    images: [
      {
        url: '/favicon.ico', // Idealmente usar una imagen de 1200x630, pero favicon sirve de momento
        width: 512,
        height: 512,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HUB 903 | FPS Boost & PC Optimization',
    description: 'Descarga las mejores herramientas para gamers y optimiza tu Windows hoy mismo.',
    images: ['/favicon.ico'],
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
        {/* JSON-LD para Google (SEO Avanzado) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HUB 903",
              "operatingSystem": "Windows 10, Windows 11",
              "applicationCategory": "UtilitiesApplication, GameApplication",
              "description": "Herramientas de optimización de alto nivel y software descentralizado para maximizar FPS y rendimiento.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1240"
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
              // --- ESCUDO ANTI-SPAM (Rate Limiting) ---
              var now = Date.now();
              var logs = JSON.parse(sessionStorage.getItem('sec_logs') || '[]');
              // Limpiar logs de más de 1 minuto
              logs = logs.filter(function(t) { return now - t < 60000; });
              
              if (logs.length >= 3) {
                console.error("🛡️ ANTI-SPAM: Demasiadas alertas. Bloqueando envío.");
                return;
              }
              
              logs.push(now);
              sessionStorage.setItem('sec_logs', JSON.stringify(logs));
              // ----------------------------------------

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
