'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, Shield, LogIn, UserPlus, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [gunUser, setGunUser] = useState<any>(null)
  const [honeyPot, setHoneyPot] = useState('')

  useEffect(() => {
    const initGun = async () => {
      const Gun = (await import('gun')).default;
      await import('gun/sea');
      const gun = Gun({ peers: PEERS });
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
        toast.success(`Bienvenido, ${user.is.alias}`);
      });
    };

    if (typeof window !== 'undefined') initGun();
  }, [])

  const handleRegister = () => {
    if (honeyPot) return;
    if (!gunUser) return;
    const cleanUser = DOMPurify.sanitize(username).trim();
    if (!cleanUser || !password) return toast.error('Completa todos los campos');
    
    setLoading(true);
    gunUser.create(cleanUser, password, (ack: any) => {
      if (ack.err) {
        toast.error(ack.err);
        setLoading(false);
      } else {
        toast.success('Cuenta P2P creada');
        handleLogin();
      }
    });
  }

  const handleLogin = () => {
    if (honeyPot) return;
    if (!gunUser) return;
    const cleanUser = DOMPurify.sanitize(username).trim();
    if (!cleanUser || !password) return toast.error('Completa todos los campos');
    
    setLoading(true);
    gunUser.auth(cleanUser, password, (ack: any) => {
      if (ack.err) {
        toast.error('Credenciales incorrectas');
        setLoading(false);
      }
    });
  }

  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    toast.info('Sesión cerrada');
    setIsLoggedIn(false);
    setCurrentUser('');
    setTimeout(() => window.location.reload(), 500);
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl text-center space-y-8">
          <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] border border-green-500/20 flex items-center justify-center mx-auto text-green-400"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sesión Activa</h2>
          <p className="text-gray-400">Identidad: <span className="text-purple-400 font-bold">{currentUser}</span></p>
          <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-purple-600 rounded-2xl font-black shadow-lg shadow-purple-900/20 transition-all hover:bg-purple-500 uppercase">Volver al Hub</button>
            <button onClick={handleLogout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 hover:text-red-400 transition-all uppercase text-xs">Cerrar Sesión Segura</button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32">
      <div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" /></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase">Ordasin Hub</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Acceso Descentralizado</p>
          </div>
          <div className="space-y-4">
            <input type="text" value={honeyPot} onChange={(e) => setHoneyPot(e.target.value)} className="absolute opacity-0 -z-50 pointer-events-none" tabIndex={-1} autoComplete="off" />
            <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"/></div>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={50} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"/></div>
            <div className="pt-6 flex flex-col gap-4">
              {mode === 'login' ? (
                <><button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all shadow-xl">{loading ? '...' : 'ENTRAR'}</button>
                <button onClick={() => setMode('register')} className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">Registrar cuenta P2P</button></>
              ) : (
                <><button onClick={handleRegister} disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-500 transition-all shadow-xl">{loading ? '...' : 'CREAR IDENTIDAD'}</button>
                <button onClick={() => setMode('login')} className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">Ya tengo identidad</button></>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
