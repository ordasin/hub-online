import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { SecurityMonitor } from "@/components/SecurityMonitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Ordasin Hub Online | Software de Alto Impacto",
  description: "Ecosistema de aplicaciones, optimizadores y herramientas de vanguardia desarrolladas por Ordasin.",
  manifest: "/manifest.json",
  other: {
    // Ampliamos la CSP para permitir conexiones P2P de GunDB sin restricciones de subdominio
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gun-manhattan.herokuapp.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://grainy-gradients.vercel.app https://images.unsplash.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://gun-manhattan.herokuapp.com wss://gun-manhattan.herokuapp.com https://gun-us.herokuapp.com wss://gun-us.herokuapp.com https://gun-eu.herokuapp.com wss://gun-eu.herokuapp.com; frame-src 'none'; object-src 'none';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505]`}>
        <SecurityMonitor />
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
