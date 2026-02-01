'use client'

import { useState, useEffect } from 'react'
import Gun from 'gun'
import 'gun/sea'
import { User as UserIcon, Lock, Shield, Sparkles, LogIn, UserPlus, LogOut, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

// Nodos de relevo P2P para sincronización
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const user = (gun as any).user().recall({ sessionStorage: true });

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar sesión al cargar
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
  }, [])

  const handleRegister = () => {
    if (!username || !password) return setError('Por favor, completa todos los campos.');
    setLoading(true);
    user.create(username, password, (ack: any) => {
      if (ack.err) {
        setError(ack.err === 'User already created!' ? 'El usuario ya existe.' : ack.err);
        setLoading(false);
      } else {
        handleLogin();
      }
    });
  }

  const handleLogin = () => {
    if (!username || !password) return setError('Por favor, completa todos los campos.');
    setLoading(true);
    user.auth(username, password, (ack: any) => {
      if (ack.err) {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
      }
    });
  }

  const handleLogout = () => {
    user.leave();
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
            <h2 className="text-3xl font-black tracking-tighter uppercase">Sesión Segura</h2>
            <p className="text-gray-400 font-medium">Conectado como <span className="text-purple-400">{currentUser}</span></p>
          </div>
          <div className="pt-4 space-y-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
            >
              IR AL PANEL PRINCIPAL
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
            >
              DESCONECTAR P2P
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Shield size={14} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200">IDENTIDAD CIFRADA P2P</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">ORDASIN HUB</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Acceso Descentralizado</p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-[10px] font-black text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20 uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-6 flex flex-col gap-4">
              {mode === 'login' ? (
                <>
                  <button 
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'CONECTANDO...' : <><LogIn size={20} /> ENTRAR</>}
                  </button>
                  <button 
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-gray-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    ¿NUEVO AQUÍ? CREAR CUENTA
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'CREANDO...' : <><UserPlus size={20} /> REGISTRARME</>}
                  </button>
                  <button 
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-gray-500 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    YA TENGO CUENTA, VOLVER AL LOGIN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center gap-4 justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1"><Shield size={12}/> ENCRIPTADO</div>
          <div className="w-1 h-1 bg-gray-800 rounded-full"/>
          <div className="flex items-center gap-1"><Sparkles size={12}/> DESCENTRALIZADO</div>
        </div>
      </motion.div>
    </main>
  )
}