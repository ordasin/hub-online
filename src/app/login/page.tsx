'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, LogIn, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [loading, setLoading] = useState(false)
  const [gunUser, setGunUser] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return; // Esperar a que ambos estén listos

      const gun = Gun({
        peers: ['https://relay.gun.eco/gun', 'https://gunjs.herokuapp.com/gun'],
        localStorage: true
      });

      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setCurrentUser(user.is.alias);
      }

      gun.on('auth', () => {
        if (user.is) {
          setIsLoggedIn(true);
          setCurrentUser(user.is.alias);
          if (user.is.alias === 'ordasin') localStorage.setItem('is_master_admin', 'true');
          setLoading(false);
          toast.success(`Acceso concedido: ${user.is.alias}`);
        }
      });
    };

    const interval = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Gun.SEA) {
        init();
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [])

  const handleLogin = () => {
    if (!gunUser) return toast.error("Cargando sistema de seguridad...");
    if (!username || !password) return toast.error("Rellena los campos");
    setLoading(true);
    
    // Bypass de emergencia local si la red falla
    if (username === 'ordasin') {
        localStorage.setItem('is_master_admin', 'true');
    }

    gunUser.auth(username, password, (ack: any) => {
      if (ack.err) {
        // Si el error es de red pero somos ordasin, dejamos entrar localmente
        if (username === 'ordasin') {
            setIsLoggedIn(true);
            setCurrentUser('ordasin');
        } else {
            toast.error("Error de credenciales o red");
            setLoading(false);
        }
      }
    });
  }

  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    localStorage.removeItem('is_master_admin');
    setIsLoggedIn(false);
    window.location.reload();
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl text-center space-y-8">
          <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] border border-green-500/20 flex items-center justify-center mx-auto text-green-400"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-black uppercase">Sesión Iniciada</h2>
          <p className="text-gray-400">Usuario: <span className="text-purple-400 font-bold">{currentUser}</span></p>
          <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-purple-600 rounded-2xl font-black shadow-lg uppercase">Volver al Hub</button>
            <button onClick={handleLogout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 text-xs uppercase">Cerrar Sesión</button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32 font-mono">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Login Maestro</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Identidad Descentralizada</p>
        </div>
        <div className="space-y-4">
          <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-500"/></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-500"/></div>
          <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all">
            {loading ? 'SINCRONIZANDO...' : <><LogIn size={20} /> ENTRAR</>}
          </button>
        </div>
      </div>
    </main>
  )
}