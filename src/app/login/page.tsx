'use client'

import { useState } from 'react'
import { Key } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const handleRescue = () => {
    // Marcamos localmente que somos ordasin y saltamos al admin
    localStorage.setItem('master_admin_bypass', 'true');
    localStorage.setItem('last_logged_user', 'ordasin');
    toast.success("ENTRANDO COMO MAESTRO...");
    setTimeout(() => window.location.href = '/admin', 1000);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Master Key</h1>
        <button 
          onClick={handleRescue}
          className="w-full py-6 bg-white text-black rounded-3xl font-black text-sm flex items-center justify-center gap-3 hover:bg-purple-500 hover:text-white transition-all shadow-2xl"
        >
          <Key size={24} />
          RECUPERAR ACCESO MAESTRO
        </button>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
          Al pulsar este botón, el sistema te identificará localmente como el administrador principal.
        </p>
      </div>
    </main>
  )
}