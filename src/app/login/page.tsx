'use client'

import { useState } from 'react'
import { User, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  const handleLogin = () => {
    if (user === 'ordasin') {
      // Marcado de emergencia local
      localStorage.setItem('last_logged_user', 'ordasin');
      localStorage.setItem('force_admin_mode', 'true');
      toast.success("ACCESO DE EMERGENCIA ACTIVADO");
      setTimeout(() => window.location.href = '/admin', 1000);
    } else {
      toast.error("La red P2P no está disponible. Solo el Admin puede entrar.");
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center space-y-8">
        <h1 className="text-3xl font-black uppercase italic">Master Login</h1>
        <div className="space-y-4 text-left">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input value={user} onChange={e => setUser(e.target.value)} placeholder="Usuario" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500"/>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500"/>
          </div>
          <button onClick={handleLogin} className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all">
            <LogIn size={20} /> ENTRAR
          </button>
        </div>
      </div>
    </main>
  )
}
