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
        
        {/* Escudo de Vigilancia Global: V5 ULTRA-AGRESSIVE */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var TOPIC = 'ordasin_security_v10';
            var devtoolsOpen = false;

            var report = function(type, details, risk) {
              var riskVal = risk || 'HIGH';
              var ntfyUrl = 'https://ntfy.sh/' + TOPIC + '?title=' + encodeURIComponent('🚨 SECURITY: ' + type) + '&priority=' + (riskVal === 'CRITICAL' ? '5' : '4') + '&tags=warning,skull';
              
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
                  platform: navigator.platform
                },
                details: details
              };

              fetch(ntfyUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain' },
                keepalive: true
              }).catch(function() {});
            };

            // 1. Detección por Atajos de Teclado (F12, Inspect, View Source)
            window.addEventListener('keydown', function(e) {
              if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || (e.ctrlKey && e.keyCode === 85)) {
                report('F12_KEY_PRESSED', 'El usuario ha pulsado F12 o Atajo de Inspección', 'CRITICAL');
              }
            });

            // 2. Detección por Tamaño de Ventana (Drawer Detect)
            var checkSize = function() {
              var threshold = 160;
              var isDev = (window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold);
              if (isDev && !devtoolsOpen) {
                devtoolsOpen = true;
                report('CONSOLE_DRAWER_DETECTED', 'Se ha abierto la consola de desarrollador', 'CRITICAL');
              } else if (!isDev) {
                devtoolsOpen = false;
              }
            };
            setInterval(checkSize, 1000);
            window.addEventListener('resize', checkSize);

            // 3. Detección por Console Getter (Deep Inspect)
            var devtools = { open: false };
            var element = new Image();
            Object.defineProperty(element, 'id', {
              get: function() {
                if (!devtools.open) {
                  report('DEEP_CONSOLE_ACCESS', 'Acceso interno a consola detectado (Getter)', 'CRITICAL');
                  devtools.open = true;
                }
              }
            });
            setInterval(function() {
              console.log(element);
              console.clear();
            }, 2000);

            // Honeypots
            Object.defineProperty(window, '_admin', { get: function() { report('HONEYPOT', 'window._admin'); return "ACCESS_DENIED"; } });
          })();
        `}} />
      </body>
    </html>
  );
}
