'use client'

import { useState, useEffect } from 'react'
import { Shield, Wifi, Activity, Terminal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const [threats, setThreats] = useState<any[]>([])
  const [peers, setPeers] = useState(0)

  useEffect(() => {
    // @ts-ignore
    if (!window.Gun) return;
    // @ts-ignore
    const gun = window.Gun({
      peers: ['https://relay.gun.eco/gun', 'https://gun-manhattan.herokuapp.com/gun'],
      localStorage: true
    });

    gun.on('hi', () => setPeers(p => p + 1));

    gun.get('VIGILANCE_V1').map().on((data: any, id: string) => {
      if (data && data.time) {
        setThreats(prev => [data, ...prev.filter(t => t.id !== id)].slice(0, 20));
      }
    });
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 border-2 border-red-600/20 bg-red-950/10 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="text-red-600 animate-pulse" size={32} />
            <h1 className="text-2xl font-black uppercase tracking-widest">Master Console</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full border border-white/10 text-[10px] font-black">
            <Wifi size={14} className={peers > 0 ? "text-green-400" : "text-red-500"}/>
            <span>NODOS: {peers}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
            {threats.map(t => (
                <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                    <span className="text-red-500 font-black text-xs uppercase tracking-tighter">Amenaza detectada</span>
                    <span className="text-white font-black text-[10px]">{new Date(t.time).toLocaleTimeString()}</span>
                </div>
            ))}
            {threats.length === 0 && <p className="text-center py-20 text-gray-700 uppercase text-[10px] font-black tracking-widest animate-pulse">Monitor de Seguridad Activo...</p>}
        </div>
      </div>
    </main>
  )
}
