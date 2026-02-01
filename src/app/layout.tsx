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
        {/* CARGA DE LIBRERÍAS DESDE CDN ESTABLE */}
        <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
        {/* ESCUDO DE ENTRADA */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var url = decodeURIComponent(window.location.href).toUpperCase();
                var patterns = ['<SCRIPT', 'ALERT(', 'UNION', 'OR 1=1', 'DROP', 'CAT /ETC/'];
                if (patterns.some(function(p) { return url.indexOf(p) !== -1; })) {
                  window.stop();
                  window.location.replace('/trap?q=' + encodeURIComponent(window.location.search));
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
