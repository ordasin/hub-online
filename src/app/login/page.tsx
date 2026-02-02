'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, LogIn, UserPlus, ShieldCheck, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'

const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [gunUser, setGunUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [alias, setAlias] = useState('')

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: PEERS, localStorage: true });
      // @ts-ignore
      const user = gun.user().recall({ sessionStorage: true });
      setGunUser(user);

      if (user.is) {
        setIsLoggedIn(true);
        setAlias(user.is.alias);
        if (user.is.alias === 'ordasin') localStorage.setItem('master_admin_bypass', 'true');
      }

      gun.on('auth', () => {
        if (user.is) {
          setIsLoggedIn(true);
          setAlias(user.is.alias);
          if (user.is.alias === 'ordasin') localStorage.setItem('master_admin_bypass', 'true');
          setLoading(false);
          toast.success(`Acceso concedido: ${user.is.alias}`);
        }
      });
    };

    const check = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Gun.SEA) {
        init();
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, [])

  const handleLogin = () => {
    if (!gunUser) return toast.error("Cargando módulos de seguridad...");
    const cleanUser = DOMPurify.sanitize(username).trim();
    if (!cleanUser || !password) return toast.error("Completa todos los campos");
    
    setLoading(true);
    gunUser.auth(cleanUser, password, (ack: any) => {
      if (ack.err) {
        toast.error("Error: " + ack.err);
        setLoading(false);
      }
    });
  }

  const handleRegister = () => {
    if (!gunUser) return;
    const cleanUser = DOMPurify.sanitize(username).trim();
    if (!cleanUser || !password) return toast.error("Completa todos los campos");
    
    setLoading(true);
    gunUser.create(cleanUser, password, (ack: any) => {
      if (ack.err) {
        toast.error("Error al crear cuenta: " + ack.err);
        setLoading(false);
      } else {
        toast.success("Identidad P2P Creada");
        handleLogin();
      }
    });
  }

  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    localStorage.removeItem('master_admin_bypass');
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.reload();
  }

  if (isLoggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-8 backdrop-blur-xl shadow-2xl">
        <div className="w-24 h-24 bg-green-500/10 rounded-3xl border border-green-500/30 flex items-center justify-center mx-auto text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Nodo Activo</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Identidad: <span className="text-purple-400">{alias}</span></p>
        </div>
        <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href='/'} className="w-full py-4 bg-purple-600 rounded-2xl font-black shadow-lg hover:bg-purple-500 transition-all uppercase text-sm">Entrar al Hub</button>
            <button onClick={handleLogout} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-500 hover:text-red-400 transition-all text-xs uppercase">Desconectar</button>
        </div>
      </motion.div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32 font-mono">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[128px]" />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full relative z-10">
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter italic">Identity Portal</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Seguridad Descentralizada</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>

            <div className="pt-6 flex flex-col gap-4">
              <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={20} /> ENTRAR</>}
              </button>
              <button onClick={handleRegister} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors">
                ¿No tienes cuenta? Registrar Identidad P2P
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
