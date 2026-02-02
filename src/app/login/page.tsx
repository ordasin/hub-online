'use client'

import { useState, useEffect } from 'react'
import { User, Shield, Sparkles, Key } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')

  const generateMasterIdentity = async () => {
    // @ts-ignore
    const Gun = window.Gun;
    if (!Gun || !Gun.SEA) return toast.error("Cargando módulos de seguridad...");

    try {
      // 1. Generar un par de llaves nuevo
      const pair = await Gun.SEA.pair();
      // 2. Guardar en el almacenamiento del navegador como si fuera un login real
      localStorage.setItem('gun/auth', JSON.stringify({ put: pair, pub: pair.pub }));
      localStorage.setItem('master_admin_bypass', 'true');
      localStorage.setItem('last_logged_user', 'ordasin');
      
      toast.success("IDENTIDAD MAESTRA GENERADA");
      setTimeout(() => window.location.href = '/admin', 1500);
    } catch (e) {
      toast.error("Error al generar llaves");
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Identity Portal</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Protocolo de Recuperación</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={generateMasterIdentity}
            className="w-full py-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-3xl font-black flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-purple-900/20"
          >
            <Key size={32} />
            <div className="text-sm">CREAR IDENTIDAD MAESTRA</div>
            <span className="text-[8px] opacity-60 uppercase tracking-widest font-black">Generación Criptográfica Local</span>
          </button>

          <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed px-4">
            Este proceso generará tu llave privada localmente. No requiere conexión a internet.
          </p>
        </div>
      </div>
    </main>
  )
}
