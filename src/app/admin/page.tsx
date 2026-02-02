'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, Package, Wifi, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const MASTER_PUB = "6mwMzGdVuCtE-sd_7_5RJ5AUeEbA-i3JwZ0UjiaxAtE.KH6lWH55LxsAE2D7ZBQQKlJgod5hqIHzwcoJ25gjqHo";
const PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'wss://gun-us.herokuapp.com/gun',
  'https://peer.wall.org/gun',
  'https://relay.gun.eco/gun'
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [detectedPub, setDetectedPub] = useState<string>("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gun, setGun] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [threats, setThreats] = useState<any[]>([])
  const [newProject, setNewProject] = useState({ title: '', version: '', desc: '' })
  const [peers, setPeers] = useState(0)
  const [activePeer, setActivePeer] = useState<string>("Buscando...")
  // const [netStatus, setNetStatus] = useState<string>("Iniciando...")

  useEffect(() => {
    const init = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const g = Gun({ peers: PEERS, localStorage: true, retry: 500 });
      setGun(g);

      // @ts-expect-error Gun types
      g.user().recall({ sessionStorage: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.on('hi', (peer: any) => {
        setPeers(p => p + 1);
        setActivePeer(peer.url || "Nodo");
        // setNetStatus("Conectado");
      });

      const sync = () => {
        const user = g.user();
        if (user.is) {
          setDetectedPub(user.is.pub);
          const normalizedMaster = MASTER_PUB.replace(/^~/, '').trim();
          const normalizedCurrent = user.is.pub.replace(/^~/, '').trim();
          if (normalizedCurrent === normalizedMaster) setIsAdmin(true);
          else setIsAdmin(false);
        }
      };

      const checker = setInterval(() => {
        if (g.user().is) {
          sync();
          clearInterval(checker);
        }
      }, 1000);

      setTimeout(() => {
        if (!g.user().is) {
          setIsAdmin(false);
          // setNetStatus("Sesión no detectada");
        }
        clearInterval(checker);
      }, 10000);

      g.on('auth', sync);

      // ESCUCHA NTFY
      const eventSource = new EventSource('https://ntfy.sh/ordasin_security_v10/sse');
      
      eventSource.onmessage = (e) => {
        try {
          const ntfyData = JSON.parse(e.data);
          // ntfy envía los datos en la propiedad 'message'
          if (ntfyData.message) {
            let logData;
            try {
              logData = JSON.parse(ntfyData.message);
            } catch {
              logData = { 
                id: 'RAW_' + Date.now(), 
                type: 'UNKNOWN_ALERT', 
                time: Date.now(), 
                details: ntfyData.message 
              };
            }
            setThreats(prev => [logData, ...prev.filter(t => t.id !== logData.id)].sort((a,b) => b.time - a.time).slice(0, 10));
            toast.warning("¡Aviso en tiempo real!", { description: logData.details });
          }
        } catch (err) {
          console.error("Error al procesar alerta:", err);
        }
      };

      eventSource.onerror = () => {
        // setNetStatus("Error en canal de alertas");
      };

      return () => {
        eventSource.close();
        clearInterval(checker);
      }
    };

    const loader = setInterval(() => {
      // @ts-expect-error Gun via CDN
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(loader); }
    }, 1000);
    return () => clearInterval(loader);
  }, []);

  const forceReconnect = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const simulateAttack = async () => {
    const testLog = { id: 'TEST'+Date.now(), type: 'TEST', time: Date.now(), details: 'ALERTA DE PRUEBA MANUAL' };
    await fetch('https://ntfy.sh/ordasin_security_v10', { 
      method: 'POST', 
      body: JSON.stringify(testLog)
    });
    toast.info("Simulación enviada");
  };

  if (isAdmin === null) return (
    <div className="min-h-screen bg-black text-purple-500 flex flex-col items-center justify-center font-mono p-10 text-center">
      <div className="animate-spin mb-4"><Wifi size={40}/></div>
      <p className="text-[10px] uppercase tracking-widest animate-pulse">Sincronizando Identidad Maestra...</p>
      <button onClick={forceReconnect} className="mt-8 text-[8px] border border-white/10 px-4 py-2 rounded-full text-gray-600 hover:text-white transition-all">Limpiar y Resetear</button>
    </div>
  );

  if (isAdmin === false) return (
    <div className="min-h-screen bg-black text-red-500 flex flex-col items-center justify-center font-black p-10 text-center uppercase space-y-6">
      <AlertTriangle size={60} className="animate-bounce"/>
      <h2 className="text-2xl tracking-tighter">Acceso Denegado</h2>
      {detectedPub && <code className="text-[8px] text-gray-600 break-all max-w-md p-4 bg-white/5 rounded-xl">{detectedPub}</code>}
      <button onClick={() => window.location.href='/login'} className="px-10 py-4 bg-white text-black text-xs rounded-2xl font-black">Identificarse</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg"><Shield size={32} /></div>
            <div>
              <h1 className="text-3xl font-black uppercase italic italic">Master System</h1>
              <div className="flex items-center gap-4 text-[10px] text-green-500 font-black mt-1">
                <span><Wifi size={12} className="inline mr-1"/> NODOS: {peers}</span>
                <span className="text-gray-500">RELAY: {activePeer}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={simulateAttack} className="px-6 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all">SIMULAR TEST</button>
            <button onClick={() => window.location.href='/'} className="px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] hover:bg-red-500 hover:text-white transition-all">EXIT</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registro de Invasores */}
          <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
            <h2 className="text-lg font-black uppercase flex items-center gap-2 text-red-400"><Activity size={18}/> Invasores</h2>
            <div className="space-y-3">
              {threats.map(t => (
                <div key={t.id} className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl">
                  <p className="text-[8px] font-black text-red-500 uppercase">{new Date(t.time).toLocaleTimeString()} - DETECTADO</p>
                  <p className="text-[10px] text-gray-300 mt-1">{t.details}</p>
                </div>
              ))}
              {threats.length === 0 && <p className="text-center py-10 text-gray-700 text-xs italic">Escaneando red...</p>}
            </div>
          </section>

          {/* Resto de herramientas */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 shadow-2xl">
                <h2 className="text-xl font-black uppercase flex items-center gap-2 text-purple-400"><Package size={20}/> Publicar Software</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nombre" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                    <input placeholder="Versión" value={newProject.version} onChange={(e) => setNewProject({...newProject, version: e.target.value})} className="bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <textarea placeholder="Descripción detallada..." value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} className="w-full h-20 bg-black border border-white/10 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => gun && gun.get('p2p_projects').set({ ...newProject, time: Date.now() })} className="w-full py-4 bg-purple-600 rounded-2xl font-black hover:bg-purple-500 transition-all">EMITIR AL HUB</button>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}