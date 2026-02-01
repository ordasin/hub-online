'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Wifi, Terminal, ShieldAlert, Trash2, RefreshCw, Lock, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const MASTER_PUB = "1ssBJ21YO8u8ONhlR1iokrR1_23Vnci4o1nPQDJvyU0.MjwgKU7CCEKsI08ptqpGgdwnp-IVRtxRDjHCt9XiWhw";
const PEERS = ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null) // null = verificando
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)
  const [gun, setGun] = useState<any>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    let gunInstance: any = null;

    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      if (!Gun) return;

      gunInstance = Gun({ peers: PEERS, localStorage: true });
      setGun(gunInstance);

      gunInstance.on('hi', () => setPeers(p => p + 1));
      gunInstance.on('bye', () => setPeers(p => Math.max(0, p - 1)));

      // @ts-ignore
      const user = gunInstance.user().recall({ sessionStorage: true });
      
      const checkUser = () => {
        if (user.is) {
          setUserName(user.is.alias);
          if (user.is.pub === MASTER_PUB) {
            setIsAdmin(true);
            toast.success("ACCESO MAESTRO CONFIRMADO");
          } else {
            setIsAdmin(false);
          }
        } else {
          // Si no hay sesión, esperamos un poco por si Gun está cargando
          setTimeout(() => {
            if (!user.is) setIsAdmin(false);
          }, 3000);
        }
      };

      checkUser();
      gunInstance.on('auth', checkUser);

      gunInstance.get('ORDASIN_SEC_V7').map().on((data: any, id: string) => {
        if (data && data.time) {
          setThreats(prev => {
            if (prev.find(t => t.id === id)) return prev;
            return [{...data, id}, ...prev].sort((a,b) => b.time - a.time).slice(0, 30);
          });
        }
      });
    };

    const loader = setInterval(() => {
      // @ts-ignore
      if (window.Gun) {
        init();
        clearInterval(loader);
      }
    }, 500);
    return () => clearInterval(loader);
  }, [])

  // PANTALLA DE CARGA / VERIFICACIÓN
  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-black text-gray-500 flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <RefreshCw className="mx-auto animate-spin text-purple-500" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Verificando Credenciales P2P...</p>
        </div>
      </main>
    );
  }

  // PANTALLA DE ACCESO DENEGADO
  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono p-6">
        <div className="max-w-md w-full border border-red-900/30 p-10 bg-red-900/5 rounded-[3rem] text-center space-y-6">
          <Lock size={48} className="mx-auto text-red-600" />
          <h1 className="text-2xl font-black uppercase italic">Acceso Restringido</h1>
          <p className="text-xs text-red-900 font-bold uppercase">Tu llave pública no tiene permisos de administración.</p>
          <div className="pt-6">
            <button onClick={() => window.location.href='/login'} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all">Cambiar de Cuenta</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-[2.5rem] flex justify-between items-center shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <UserCheck className="text-green-500" size={32} />
            <div>
                <h1 className="text-2xl font-black uppercase tracking-widest italic">{userName} @ HUB</h1>
                <p className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-2">
                    <Wifi size={12} className={peers > 0 ? 'text-green-500' : 'text-red-500'} />
                    NODOS: {peers}
                </p>
            </div>
          </div>
          <button onClick={() => window.location.href='/'} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all">Hub Home</button>
        </div>

        <div className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2 px-2"><Activity size={14}/> Intrusion Logs</h2>
            <div className="grid grid-cols-1 gap-2">
                {threats.map(t => (
                    <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl flex justify-between items-center">
                        <span className="text-red-500 font-black text-xs uppercase tracking-widest">Alerta Capturada</span>
                        <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                    </div>
                ))}
                {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black animate-pulse">Sin amenazas detectadas en la red...</p>}
            </div>
        </div>
      </div>
    </main>
  )
}
