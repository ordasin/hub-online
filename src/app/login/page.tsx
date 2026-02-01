'use client'

import { useState, useEffect } from 'react'
import Gun from 'gun'
import 'gun/sea' // Security, Encryption, Authorization
import { User as UserIcon, Lock, Shield, Sparkles, LogIn, UserPlus, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Inicializar Gun con nodos de relevo públicos para sincronización P2P
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const user = (gun as any).user().recall({ sessionStorage: true });

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  useEffect(() => {
    // Comprobar si ya hay una sesión activa
    if (user.is) {
      setIsLoggedIn(true);
      setCurrentUser(user.is.alias);
    }

    gun.on('auth', () => {
      const alias = user.is.alias;
      setIsLoggedIn(true);
      setCurrentUser(alias);
      setError('');
    });
  }, [])

  const handleRegister = () => {
    if (!username || !password) return setError('Rellena todos los campos');
    user.create(username, password, (ack: any) => {
      if (ack.err) {
        setError(ack.err);
      } else {
        handleLogin();
      }
    });
  }

  const handleLogin = () => {
    if (!username || !password) return setError('Rellena todos los campos');
    user.auth(username, password, (ack: any) => {
      if (ack.err) {
        setError(ack.err);
      }
    });
  }

  const handleLogout = () => {
    user.leave();
    setIsLoggedIn(false);
    setCurrentUser('');
    window.location.reload(); // Limpiar estado de Gun
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto text-green-400">
            <Shield size={40} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">¡BIENVENIDO!</h2>
          <p className="text-gray-400">Sesión P2P iniciada como <span className="text-purple-400 font-bold">{currentUser}</span></p>
          <div className="pt-6">
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              <LogOut size={18} />
              Cerrar Sesión Segura
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">Identidad Descentralizada</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">ORDASIN ID</h1>
            <p className="text-gray-500 text-sm font-medium">Base de datos P2P sin servidores.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-4 flex flex-col gap-3">
              {mode === 'login' ? (
                <>
                  <button 
                    onClick={handleLogin}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    INICIAR SESIÓN
                  </button>
                  <button 
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-gray-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleRegister}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={20} />
                    CREAR CUENTA P2P
                  </button>
                  <button 
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-gray-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Ya tengo cuenta, quiero entrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
          Tus datos se encriptan localmente y se guardan en la red distribuida. Nadie más puede acceder a ellos.
        </p>
      </motion.div>
    </main>
  )
}
