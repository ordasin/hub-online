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
        
        {/* Escudo de Vigilancia Global */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const report = (type, details) => {
              fetch('https://ntfy.sh/ordasin_security_v10', {
                method: 'POST',
                body: JSON.stringify({
                  id: 'GLOB_' + Math.random().toString(36).substring(7),
                  type: type,
                  time: Date.now(),
                  details: details
                }),
                headers: { 'Content-Type': 'application/json' }
              }).catch(() => {});
            };

            // 1. Detectar Herramientas de Desarrollador (F12)
            let devtools = false;
            const threshold = 160;
            setInterval(() => {
              const widthThreshold = window.outerWidth - window.innerWidth > threshold;
              const heightThreshold = window.outerHeight - window.innerHeight > threshold;
              if (widthThreshold || heightThreshold) {
                if (!devtools) {
                  report('DEVTOOLS_OPENED', 'El usuario ha abierto la consola de desarrollador');
                  devtools = true;
                }
              } else {
                devtools = false;
              }
            }, 2000);

            // 2. Detectar Atajos de Teclado (View Source, etc)
            window.addEventListener('keydown', (e) => {
              if ((e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i' || e.key === 'j')) || e.key === 'F12') {
                report('FORBIDDEN_SHORTCUT', 'Intento de inspección de código: ' + e.key);
              }
            });

            // 3. Sniffer Global de Payloads en cualquier Input
            document.addEventListener('input', (e) => {
              if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const val = e.target.value;
                const patterns = [/<script/i, /alert\\(/i, /' OR /i, /UNION SELECT/i, /..\\//i];
                if (patterns.some(p => p.test(val))) {
                  report('GLOBAL_WAF_HIT', 'Payload detectado en ' + e.target.placeholder + ': ' + val);
                }
              }
            });
          })();
        `}} />
      </body>
    </html>
  );
}