'use client'

import { useState, useEffect } from 'react'
import { User, Lock, LogIn, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const PEERS = ['https://relay.gun.eco/gun', 'https://gunjs.herokuapp.com/gun'];

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [gunUser, setGunUser] = useState<any>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      // @ts-ignore
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: PEERS, localStorage: true });
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
          toast.success("SISTEMA AUTENTICADO");
        }
      });
    };

    const checker = setInterval(init, 1000);
    return () => clearInterval(checker);
  }, [])

  const handleLogin = () => {
    if (!gunUser) return toast.error("Cargando módulos de seguridad...");
    gunUser.auth(username, password, (ack: any) => {
      if (ack.err) toast.error("Fallo de identidad");
    });
  }

  const handleRegister = () => {
    if (!gunUser) return;
    gunUser.create(username, password, (ack: any) => {
      if (ack.err) toast.error(ack.err);
      else handleLogin();
    });
  }

  if (isLoggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <CheckCircle2 size={64} className="text-green-500 mx-auto" />
        <h1 className="text-2xl font-black uppercase tracking-widest">{currentUser}</h1>
        <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black font-black rounded-xl">HUB HOME</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-8 font-mono">
        <h1 className="text-3xl font-black uppercase italic text-center tracking-tighter">P2P Security</h1>
        <div className="space-y-4">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={handleLogin} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-purple-500 hover:text-white transition-all">ACCEDER</button>
          <button onClick={handleRegister} className="w-full text-[10px] text-gray-600 font-bold uppercase tracking-widest">Crear nueva identidad</button>
        </div>
      </div>
    </main>
  )
}
