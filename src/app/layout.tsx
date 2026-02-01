import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = { themeColor: "#050505", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: "Ordasin Hub Online",
  description: "Software de Alto Impacto",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/gun/sea.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var url = decodeURIComponent(window.location.href).toUpperCase();
                // DICCIONARIO DE PAYLOADS EXPANDIDO
                var patterns = {
                  'XSS': ['<SCRIPT', 'ALERT(', 'ONERROR=', 'ONLOAD=', 'PROMPT(', 'CONFIRM(', 'EVAL(', 'JAVASCRIPT:'],
                  'SQLi': ['SELECT', 'UNION', 'DROP', 'INSERT', 'UPDATE', 'OR 1=1', 'OR 1=0', '--', 'BENCHMARK('],
                  'LFI/Path': ['../', '..%2F', 'ETC/PASSWD', '.ENV', 'BOOT.INI'],
                  'RCE/Cmd': ['; LS', '| CAT', '$(WHOAMI)', 'SYSTEM(', 'SHELL_EXEC']
                };
                
                for (var type in patterns) {
                  if (patterns[type].some(p => url.indexOf(p) !== -1)) {
                    window.stop();
                    window.location.replace('/trap?cause=' + type + '&payload=' + btoa(window.location.search));
                    break;
                  }
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505]`}>
        <Toaster position="bottom-right" theme="dark" richColors />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
