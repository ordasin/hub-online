'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'

interface Node {
  id: string
  lat: number
  lon: number
  city: string
  time: number
}

export function P2PMap() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    const initMap = async () => {
      // @ts-expect-error Gun via CDN
      const Gun = window.Gun;
      if (!Gun) return;

      const gun = Gun(['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun']);
      
      // 1. Reportar mi presencia (Anónima)
      try {
        const res = await fetch('https://ipapi.co/json/').then(r => r.json());
        if (res.latitude && res.longitude) {
          const myId = Math.random().toString(36).substring(7);
          gun.get('hub_active_nodes').get(myId).put({
            id: myId,
            lat: res.latitude,
            lon: res.longitude,
            city: res.city,
            time: Date.now()
          });
          
          // Limpiar mi rastro al salir
          window.addEventListener('beforeunload', () => {
            gun.get('hub_active_nodes').get(myId).put(null);
          });
        }
      } catch {}

      // 2. Escuchar otros nodos
      gun.get('hub_active_nodes').map().on((data: Node, id: string) => {
        if (data && data.time > Date.now() - 1000 * 60 * 10) { // Últimos 10 min
          setNodes(prev => [...prev.filter(n => n.id !== id), data]);
        } else {
          setNodes(prev => prev.filter(n => n.id !== id));
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun via CDN
      if (window.Gun) { initMap(); clearInterval(checker); }
    }, 1000);

    return () => clearInterval(checker);
  }, []);

  useEffect(() => {
    setCount(nodes.length);
  }, [nodes]);

  // Conversión simple de Lat/Lon a coordenadas SVG (Mollweide-ish / Equirectangular)
  const getCoords = (lat: number, lon: number) => {
    const x = (lon + 180) * (100 / 360);
    const y = (90 - lat) * (100 / 180);
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 overflow-hidden relative group">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
          <Globe size={20} className="text-purple-500 animate-spin-slow" />
          Red P2P Viva
        </h2>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase">{count} NODOS</span>
        </div>
      </div>

      <div className="relative aspect-video w-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
        {/* Mapa Mundial Simplificado (SVG) */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 stroke-white/20 fill-none">
           <path d="M10,40 Q25,35 35,45 T60,40 T90,50 M20,60 Q40,70 50,60 T80,70 M30,20 Q50,10 70,25" strokeWidth="0.5" />
           <circle cx="50" cy="50" r="45" strokeWidth="0.1" strokeDasharray="1 2" />
        </svg>

        {/* Nodos Activos */}
        <AnimatePresence>
          {nodes.map((node) => {
            const pos = getCoords(node.lat, node.lon);
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ left: pos.x, top: pos.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 blur-sm rounded-full animate-ping opacity-40" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full border border-white/50 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 border border-white/10 px-2 py-1 rounded-lg text-[8px] font-black uppercase pointer-events-none">
                    {node.city}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-20 w-full animate-scan" />
      </div>

      <p className="text-[10px] text-gray-500 italic text-center font-medium">
        Ubicación aproximada detectada vía red descentralizada.
      </p>

      <style jsx>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(400%); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
