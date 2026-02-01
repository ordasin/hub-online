'use client'

import { useState, useEffect, useRef } from 'react'
import Peer, { DataConnection } from 'peerjs'
import { Send, User, Copy, Link as LinkIcon, Shield, Zap, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatPage() {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [myId, setMyId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [conn, setConn] = useState<DataConnection | null>(null)
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Desconectado')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Inicializar PeerJS
    const newPeer = new Peer()
    
    newPeer.on('open', (id) => {
      setPeer(newPeer)
      setMyId(id)
      setStatus('Listo para conectar')
    })

    newPeer.on('connection', (connection) => {
      setupConnection(connection)
    })

    return () => {
      newPeer.destroy()
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const setupConnection = (connection: DataConnection) => {
    connection.on('open', () => {
      setConn(connection)
      setStatus('Conectado P2P')
    })

    connection.on('data', (data: any) => {
      setMessages(prev => [...prev, {
        sender: 'Peer',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    })

    connection.on('close', () => {
      setStatus('Conexión cerrada')
      setConn(null)
    })
  }

  const connectToPeer = () => {
    if (peer && targetId) {
      setStatus('Conectando...')
      const connection = peer.connect(targetId)
      setupConnection(connection)
    }
  }

  const sendMessage = () => {
    if (conn && input.trim()) {
      const msg = {
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      conn.send(msg)
      setMessages(prev => [...prev, { sender: 'Tú', ...msg }])
      setInput('')
    }
  }

  const copyId = () => {
    navigator.clipboard.writeText(myId)
    alert('ID copiado al portapapeles')
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel Izquierdo: Configuración */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Shield className="text-purple-400" size={20} />
              TU IDENTIDAD P2P
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Tu ID de conexión</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-purple-300 font-mono text-xs truncate">{myId || 'Generando...'}</code>
                  <button onClick={copyId} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${status === 'Conectado P2P' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500'}`} />
                <span className="text-gray-400 font-medium">{status}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Zap className="text-blue-400" size={20} />
              CONECTAR
            </h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Pega el ID de un amigo..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button 
                onClick={connectToPeer}
                disabled={status === 'Conectado P2P' || !targetId}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LinkIcon size={18} />
                Establecer Enlace
              </button>
            </div>
          </motion.div>
        </div>

        {/* Panel Derecho: Chat */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[600px] flex flex-col rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
          >
            {/* Header Chat */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Canal P2P Encriptado</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Punto a Punto Directo</p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center space-y-2">
                  <User size={48} strokeWidth={1} />
                  <p className="text-sm font-medium">No hay mensajes todavía.<br/>Comparte tu ID para empezar.</p>
                </div>
              )}
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === 'Tú' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className="text-[10px] opacity-50 mt-1 text-right font-bold">{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Chat */}
            <div className="p-6 bg-black/20 border-t border-white/10">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje seguro..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!conn}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!conn || !input.trim()}
                  className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:hover:bg-purple-600"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
