'use client'

import { useState, useEffect } from 'react'
import { User as UserIcon, Lock, LogIn, CheckCircle2, RefreshCw } from 'lucide-react'
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
    const initGun = () => {
      // @ts-ignore
      const Gun = window.Gun;
      // @ts-ignore
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'] });
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
          localStorage.setItem('last_logged_user', user.is.alias);
          setLoading(false);
          toast.success(`Acceso Autorizado: ${user.is.alias}`);
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Gun.SEA) {
        initGun();
        clearInterval(checker);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [])

  const handleLogin = () => {
    if (!gunUser) return toast.error("Cargando módulos de seguridad...");
    if (!username || !password) return toast.error("Completa los campos");
    setLoading(true);
    
    gunUser.auth(username, password, (ack: any) => {
      if (ack.err) {
        toast.error("Error de identidad");
        setLoading(false);
      }
    });
  }

  const handleRegister = () => {
    if (!gunUser) return;
    setLoading(true);
    gunUser.create(username, password, (ack: any) => {
      if (ack.err) {
        toast.error(ack.err);
        setLoading(false);
      } else {
        toast.success("Nueva identidad P2P registrada");
        handleLogin();
      }
    });
  }

  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    setIsLoggedIn(false);
    setCurrentUser('');
    window.location.reload();
  }

  if (isLoggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-8 backdrop-blur-xl">
        <div className="w-24 h-24 bg-green-500/10 rounded-3xl border border-green-500/20 flex items-center justify-center mx-auto text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">{currentUser}</h2>
        <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-purple-600 rounded-2xl font-black shadow-lg hover:bg-purple-500 transition-all uppercase text-sm">Entrar al Hub</button>
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
        <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8 text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">P2P Login</h1>
          <div className="space-y-4">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            <div className="pt-6 flex flex-col gap-4">
              <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-500 hover:text-white transition-all shadow-xl">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={20} /> ENTRAR</>}
              </button>
              <button onClick={handleRegister} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors">Registrar Nueva Identidad</button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
