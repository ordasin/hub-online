'use client'

import { useState, useEffect } from 'react'
import { Key, Copy, ShieldCheck, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [currentPub, setCurrentPub] = useState('')

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const isForce = localStorage.getItem('master_admin_bypass') === 'true';
      if (isForce) {
        setIsAdmin(true);
        // Intentar sacar la llave del almacenamiento si ya existe
        const raw = localStorage.getItem('gun/auth');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setCurrentPub(parsed.pub || parsed.put?.pub || '');
          } catch(e) {}
        }
      } else {
        window.location.href = '/login';
      }
    };
    check();
  }, [])

  const generateIdentity = async () => {
    // @ts-ignore
    const Gun = window.Gun;
    if (!Gun || !Gun.SEA) return toast.error("Cargando módulos criptográficos...");

    try {
      const pair = await Gun.SEA.pair();
      setCurrentPub(pair.pub);
      localStorage.setItem('gun/auth', JSON.stringify({ put: pair, pub: pair.pub }));
      toast.success("IDENTIDAD CRIPTOGRÁFICA GENERADA");
    } catch (e) {
      toast.error("Error en generación");
    }
  }

  if (isAdmin === null) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 font-mono">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Generador si no hay llave */}
        {!currentPub ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] text-center space-y-8">
            <Key size={48} className="mx-auto text-purple-500 animate-bounce" />
            <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase">Falta Identidad Digital</h2>
                <p className="text-gray-500 text-sm">Necesitas generar una firma única para que el sistema te reconozca siempre.</p>
            </div>
            <button onClick={generateIdentity} className="px-10 py-4 bg-purple-600 rounded-2xl font-black text-xs hover:bg-purple-500 shadow-xl transition-all">
                GENERAR MI LLAVE MAESTRA
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-12 bg-green-500/10 border-2 border-green-500/30 rounded-[3rem] shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-4 mb-8">
                <ShieldCheck className="text-green-500" size={32} />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Identidad Confirmada</h2>
            </div>
            <p className="text-sm text-green-400 mb-6 font-bold uppercase">Copia este código y dáselo a la IA para cerrar el sistema:</p>
            <div className="p-6 bg-black/60 rounded-[2rem] border border-green-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <code className="text-[10px] break-all text-green-500 font-black leading-relaxed">{currentPub}</code>
                <button onClick={() => { navigator.clipboard.writeText(currentPub); toast.success("ID Copiado"); }} className="p-4 bg-white text-black rounded-xl font-black text-xs hover:bg-green-500 hover:text-white transition-all">COPIAR</button>
            </div>
          </motion.div>
        )}

        <button onClick={() => window.location.href='/'} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase text-gray-500 hover:text-white transition-all">Regresar</button>
      </div>
    </main>
  )
}