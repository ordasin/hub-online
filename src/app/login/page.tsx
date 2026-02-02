'use client'

import { useState } from 'react'
import { User, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // BYPASS MAESTRO DE EMERGENCIA
    if (username === 'ordasin') {
      localStorage.setItem('master_admin_bypass', 'true');
      toast.success("ACCESO MAESTRO DE EMERGENCIA ACTIVADO");
      setTimeout(() => window.location.href = '/admin', 1000);
    } else {
      toast.error("La red P2P está sincronizando. Solo el Admin puede entrar ahora.");
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center space-y-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Emergency Login</h1>
        <div className="space-y-4">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario Maestro" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-500" />
          <button onClick={handleLogin} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all">
            FORZAR ACCESO
          </button>
        </div>
      </div>
    </main>
  )
}