'use client'

import { useState, useEffect, useRef } from 'react'
import Peer, { DataConnection } from 'peerjs'
import { Send, User, Copy, Link as LinkIcon, Shield, Zap, MessageSquare, Ban } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'

export default function ChatPage() {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [myId, setMyId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [conn, setConn] = useState<DataConnection | null>(null)
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Conectando...')
  const [isBanned, setIsBanned] = useState(false)
  const [gun, setGun] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initP2P = async () => {
      const Gun = (await import('gun')).default;
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);
      setGun(g);

      const newPeer = new Peer()
      newPeer.on('open', (id) => {
        setPeer(newPeer)
        setMyId(id)
        setStatus('Listo')

        g.get('ban_list').get(id).on((val: any) => {
          if (val === true) setIsBanned(true);
        });

        const heartbeat = setInterval(() => {
          g.get('online_users').get(id).put(Date.now());
        }, 5000);

        return () => clearInterval(heartbeat);
      })

      newPeer.on('connection', (connection) => {
        if (!isBanned) setupConnection(connection);
      })

      return () => newPeer.destroy();
    };

    if (typeof window !== 'undefined') initP2P();
  }, [isBanned])

  const setupConnection = (connection: DataConnection) => {
    connection.on('open', () => {
      setConn(connection)
      setStatus('Conectado')
    })

    connection.on('data', (data: any) => {
      // Saneamiento del mensaje recibido
      const cleanText = DOMPurify.sanitize(data.text || "");
      setMessages(prev => [...prev, {
        sender: 'Peer',
        text: cleanText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    })
  }

  const sendMessage = () => {
    if (isBanned) return alert('Has sido baneado.');
    const cleanInput = DOMPurify.sanitize(input.trim());
    if (conn && cleanInput) {
      const msg = { text: cleanInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      conn.send(msg)
      setMessages(prev => [...prev, { sender: 'Tú', ...msg }])
      setInput('')
    }
  }

  // ... resto del componente (manteniendo el JSX saneado por defecto por React)
  if (isBanned) return <div className="text-center p-20 text-red-500">ACCESO DENEGADO</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Paneles laterales */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">Tu Identidad</h2>
            <code className="text-[10px] text-purple-300 font-mono block p-4 bg-black/40 rounded-xl border border-white/5 truncate mb-4">{myId || 'Generando...'}</code>
            <button onClick={() => navigator.clipboard.writeText(myId)} className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Copiar ID</button>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">Conectar</h2>
            <input 
              value={targetId} 
              onChange={(e) => setTargetId(DOMPurify.sanitize(e.target.value))} // Sanear ID de destino
              placeholder="ID de un amigo..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs outline-none mb-4" 
            />
            <button onClick={() => peer?.connect(targetId) && setTargetId('')} className="w-full py-3 bg-blue-600 rounded-xl font-black text-xs">ESTABLECER ENLACE</button>
          </div>
        </div>

        {/* Ventana de Chat */}
        <div className="lg:col-span-2">
          <div className="h-[600px] flex flex-col rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 border border-purple-400/20"><MessageSquare size={20} /></div>
                <div><h3 className="font-bold text-sm">Canal P2P Seguro</h3><p className="text-[10px] text-gray-500 uppercase font-black">{status}</p></div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${msg.sender === 'Tú' ? 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-white/10 border border-white/5'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] opacity-40 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/10 flex gap-4">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                placeholder="Escribe un mensaje..." 
                maxLength={500}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 outline-none" 
              />
              <button onClick={sendMessage} className="p-4 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all"><Send size={20}/></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
