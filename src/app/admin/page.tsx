'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, ShieldAlert, Lock, UserCheck, Copy, Key } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [peers, setPeers] = useState(0)
  const [currentPub, setCurrentPub] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun(['https://relay.gun.eco/gun'], { localStorage: true });
      g.on('hi', () => setPeers(p => p + 1));

      // 1. Intentar sacar la llave del sistema Gun
      // @ts-ignore
      const user = g.user().recall({ sessionStorage: true });
      
      const check = () => {
        const isMasterForce = localStorage.getItem('master_admin_bypass') === 'true';
        
        if (user.is || isMasterForce) {
          setIsAdmin(true);
          setUserName(user.is?.alias || 'ordasin');
          
          // Buscar la llave pública en Gun o en el almacenamiento crudo
          const pub = user.is?.pub;
          if (pub) {
            setCurrentPub(pub);
          } else {
            // Intento de recuperación manual desde el almacenamiento
            const rawAuth = localStorage.getItem('gun/auth') || sessionStorage.getItem('gun/auth');
            if (rawAuth) {
              try {
                const parsed = JSON.parse(rawAuth);
                const extractedPub = parsed.put?.pub || parsed.pub;
                if (extractedPub) setCurrentPub(extractedPub);
              } catch(e) {}
            }
          }
        } else {
          setTimeout(() => { if (!user.is && !isMasterForce) setIsAdmin(false); }, 3000);
        }
      };

      check();
      g.on('auth', check);
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) { init(); clearInterval(loader); }
    }, 500);
    return () => clearInterval(loader);
  }, [])

  if (isAdmin === null) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-purple-500 uppercase text-[10px] animate-pulse">Sincronizando Identidad...</div>;
  if (isAdmin === false) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black uppercase p-10 text-center">Acceso Denegado</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CUADRO DE LLAVE PÚBLICA (TU IDENTIDAD REAL) */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-10 bg-purple-900/20 border-2 border-purple-500/30 rounded-[3rem] shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Key size={120} /></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40"><Key size={24} className="text-black" /></div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Firma Criptográfica</h2>
                </div>
                
                <p className="text-sm text-purple-200 mb-6 font-bold uppercase tracking-widest">Esta es tu identidad única en la red. Cópiala y dásela a la IA:</p>
                
                <div className="p-6 bg-black/60 rounded-[2rem] border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    {currentPub ? (
                        <>
                            <code className="text-[10px] md:text-xs break-all text-purple-400 font-black leading-relaxed selection:bg-purple-500 selection:text-white">
                                {currentPub}
                            </code>
                            <button 
                                onClick={() => { navigator.clipboard.writeText(currentPub); toast.success("Llave Copiada"); }}
                                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-2xl font-black text-xs hover:bg-purple-400 transition-all shadow-lg"
                            >
                                <Copy size={16} /> COPIAR ID
                            </button>
                        </>
                    ) : (
                        <p className="text-red-400 font-bold animate-pulse text-xs uppercase italic">No se ha detectado una llave en este navegador. Intenta registrarte de nuevo.</p>
                    )}
                </div>
            </div>
        </motion.div>

        <div className="p-10 border-2 border-white/5 bg-white/5 rounded-[3rem] flex justify-between items-center">
          <div className="flex items-center gap-6">
            <UserCheck className="text-green-500" size={40} />
            <div>
                <h1 className="text-3xl font-black uppercase italic tracking-widest">{userName} @ MASTER</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-2">
                    <Wifi size={12} className={peers > 0 ? 'text-green-500' : 'text-red-500'} />
                    Estado de Red: {peers > 0 ? 'CONECTADO' : 'MODO LOCAL'}
                </p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all uppercase">Escritorio</button>
        </div>
      </div>
    </main>
  )
}
