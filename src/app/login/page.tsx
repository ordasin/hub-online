'use client'

import { useState, useEffect } from 'react'
import { LogIn, CheckCircle2, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const PEERS = ['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun'];

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gunUser, setGunUser] = useState<any>(null)

  useEffect(() => {
    const initGun = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const gun = Gun({ peers: PEERS, localStorage: true, retry: 1000 });
      // @ts-expect-error Gun types not available
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
          setLoading(false);
          toast.success(`Acceso Autorizado: ${user.is.alias}`);
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun && window.Gun.SEA) {
        initGun();
        clearInterval(checker);
      }
    }, 500);
    return () => clearInterval(checker);
  }, [])

  const handleLogin = () => {
    if (honeypot) {
      console.log("⚠️ TRAMPA LOGIN ACTIVADA");
      const id = 'WAF_LOGIN_' + Math.random().toString(36).substring(7);
      fetch('https://ntfy.sh/ordasin_security_v10', {
        method: 'POST',
        body: JSON.stringify({ 
          id, 
          type: 'HONEYPOT_INJECTION', 
          time: Date.now(), 
          details: `Bot detectado en Login. Payload: "${honeypot}"` 
        })
      }).catch(() => {});
      
      setTimeout(() => { window.location.href = '/trap'; }, 500);
      return;
    }
    if (!gunUser) return toast.error("Cargando sistema P2P...");
    if (!username || !password) return toast.error("Completa los campos");
    
    setLoading(true);
    toast.info("Verificando firma en la red...");
    
    gunUser.auth(username, password, (ack: { err: string }) => {
      if (ack.err) {
        console.error("Auth Error:", ack.err);
        toast.error("Fallo de identidad: " + ack.err);
        setLoading(false);
      } else {
        // En Gun, el evento 'auth' se dispara solo, pero por seguridad:
        setIsLoggedIn(true);
        setLoading(false);
      }
    });
  }

  const handleRegister = () => {
    if (honeypot) {
      window.location.href = '/trap';
      return;
    }
    if (!gunUser) return;
    setLoading(true);
    toast.info("Registrando nueva firma criptográfica...");
    
    gunUser.create(username, password, (ack: { err: string }) => {
      if (ack.err) {
        toast.error("Error de registro: " + ack.err);
        setLoading(false);
      } else {
        toast.success("Nueva identidad generada con éxito");
        handleLogin();
      }
    });
  }

  const handleLogout = () => {
    if (gunUser) gunUser.leave();
    setIsLoggedIn(false);
    setCurrentUser('');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }

  if (isLoggedIn) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full p-12 rounded-[3rem] bg-white/5 border border-white/10 text-center space-y-8 backdrop-blur-xl shadow-2xl">
        <div className="w-24 h-24 bg-green-500/10 rounded-3xl border border-green-500/30 flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">{currentUser}</h2>
        <div className="pt-4 space-y-4">
            <button onClick={() => window.location.href = '/admin'} className="w-full py-4 bg-purple-600 rounded-2xl font-black shadow-lg hover:bg-purple-500 transition-all uppercase text-sm">Panel de Control</button>
            <button onClick={() => window.location.href = '/'} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-500 hover:text-white transition-all text-xs uppercase">Volver al Hub</button>
            <button onClick={handleLogout} className="w-full py-2 text-gray-700 hover:text-red-500 transition-all text-[10px] uppercase font-black">Cerrar Sesión</button>
        </div>
      </motion.div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 pt-32 font-mono">
      <div className="max-w-md w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl space-y-8 text-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">P2P Security</h1>
        <div className="space-y-4 text-left">
          <div className="hidden" aria-hidden="true">
            <input 
              value={honeypot} 
              onChange={e => setHoneypot(e.target.value)} 
              tabIndex={-1} 
              autoComplete="off"
            />
          </div>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
          <div className="pt-6 flex flex-col gap-4">
            <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-500 hover:text-white transition-all shadow-xl">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={20} /> ENTRAR</>}
            </button>
            <button onClick={handleRegister} disabled={loading} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors text-center">Registrar Nueva Identidad</button>
          </div>
        </div>
      </div>
    </main>
  )
}