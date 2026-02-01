'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, Shield, Sparkles, LogIn, UserPlus, LogOut, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [gunUser, setGunUser] = useState<any>(null)

  useEffect(() => {
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      const user = (gun as any).user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setCurrentUser(user.is.alias);
      }

      gun.on('auth', () => {
        setIsLoggedIn(true);
        setCurrentUser(user.is.alias);
        setLoading(false);
        setError('');
      });
    };

    if (typeof window !== 'undefined') initGun();
  }, [])

  const handleRegister = () => {
    if (!gunUser) return;
    const cleanUser = DOMPurify.sanitize(username).trim();
    const cleanPass = password.trim(); // La pass no se sanea con dompurify para no romper caracteres especiales de seguridad, pero se trimea
    
    if (!cleanUser || !cleanPass) return setError('Por favor, completa todos los campos.');
    if (cleanUser.length < 3) return setError('El usuario debe tener al menos 3 caracteres.');
    
    setLoading(true);
    gunUser.create(cleanUser, cleanPass, (ack: any) => {
      if (ack.err) {
        setError(ack.err === 'User already created!' ? 'El usuario ya existe.' : ack.err);
        setLoading(false);
      } else {
        handleLogin();
      }
    });
  }

  const handleLogin = () => {
    if (!gunUser) return;
    const cleanUser = DOMPurify.sanitize(username).trim();
    if (!cleanUser || !password) return setError('Por favor, completa todos los campos.');
    
    setLoading(true);
    gunUser.auth(cleanUser, password, (ack: any) => {
      if (ack.err) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
      }
    });
  }

  // ... resto del componente ...
  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    setIsLoggedIn(false);
    setCurrentUser('');
    window.location.reload();
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl text-center space-y-8"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Sesión Segura</h2>
            <p className="text-gray-400 font-medium">Conectado como <span className="text-purple-400">{currentUser}</span></p>
          </div>
          <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20">IR AL PANEL PRINCIPAL</button>
            <button onClick={handleLogout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 hover:text-red-400 transition-all">DESCONECTAR P2P</button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Shield size={14} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200">IDENTIDAD CIFRADA</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">ORDASIN HUB</h1>
          </div>
          <div className="space-y-4">
            <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"/></div>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={50} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"/></div>
            {error && <p className="text-red-400 text-[10px] font-black text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20 uppercase tracking-widest">{error}</p>}
            <div className="pt-6 flex flex-col gap-4">
              {mode === 'login' ? (
                <><button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'CONECTANDO...' : 'ENTRAR'}</button>
                <button onClick={() => setMode('register')} className="text-gray-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">¿NUEVO AQUÍ? CREAR CUENTA</button></>
              ) : (
                <><button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'CREANDO...' : 'REGISTRARME'}</button>
                <button onClick={() => setMode('login')} className="text-gray-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">YA TENGO CUENTA, VOLVER</button></>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}