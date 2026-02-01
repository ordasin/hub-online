'use client'

import { useState, useEffect, useRef } from 'react'
import Peer, { DataConnection } from 'peerjs'
import { Send, User, Copy, Link as LinkIcon, Shield, Zap, MessageSquare, Ban, Paperclip, FileText, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

export default function ChatPage() {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [myId, setMyId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [conn, setConn] = useState<DataConnection | null>(null)
  const [messages, setMessages] = useState<{sender: string, text?: string, time: string, isFile?: boolean, fileName?: string, fileData?: string}[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Conectando...')
  const [isBanned, setIsBanned] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initP2P = async () => {
      const Gun = (await import('gun')).default;
      const g = Gun(['https://gun-manhattan.herokuapp.com/gun']);

      const newPeer = new Peer()
      newPeer.on('open', (id) => {
        setPeer(newPeer)
        setMyId(id)
        setStatus('Listo')
        g.get('ban_list').get(id).on((val: any) => { if (val === true) setIsBanned(true); });
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
      toast.success("Enlace P2P establecido");
    })

    connection.on('data', (data: any) => {
      if (data.isFile) {
        setMessages(prev => [...prev, {
          sender: 'Peer',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFile: true,
          fileName: data.fileName,
          fileData: data.fileData
        }]);
        toast.info(`Has recibido un archivo: ${data.fileName}`);
      } else {
        setMessages(prev => [...prev, {
          sender: 'Peer',
          text: DOMPurify.sanitize(data.text || ""),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    })
  }

  const sendMessage = () => {
    if (conn && input.trim()) {
      const msg = { text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      conn.send(msg)
      setMessages(prev => [...prev, { sender: 'Tú', ...msg }])
      setInput('')
    }
  }

  const sendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && conn) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileMsg = {
          isFile: true,
          fileName: file.name,
          fileData: reader.result as string,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        conn.send(fileMsg);
        setMessages(prev => [...prev, { sender: 'Tú', ...fileMsg }]);
        toast.success("Archivo enviado");
      };
      reader.readAsDataURL(file);
    }
  }

  const downloadFile = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    link.click();
  }

  if (isBanned) return <div className="text-center p-20 text-red-500 font-black">ID BANEADO</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">Mi Identidad</h2>
            <code className="text-[10px] text-purple-300 font-mono block p-4 bg-black/40 rounded-xl border border-white/5 truncate mb-4">{myId || '...'}</code>
            <button onClick={() => { navigator.clipboard.writeText(myId); toast.info("ID Copiado"); }} className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase">Copiar ID</button>
          </div>
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">Vincular</h2>
            <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="ID Destino..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs outline-none mb-4" />
            <button onClick={() => peer?.connect(targetId)} className="w-full py-3 bg-blue-600 rounded-xl font-black text-xs">CONECTAR PC A PC</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-[600px] flex flex-col rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400"><MessageSquare size={20} /></div>
                <div><h3 className="font-bold text-sm">Canal P2P</h3><p className="text-[10px] text-gray-500 font-black">{status.toUpperCase()}</p></div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'Tú' ? 'bg-purple-600 shadow-xl' : 'bg-white/10 border border-white/5'}`}>
                    {msg.isFile ? (
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/20 rounded-xl"><FileText size={20} className="text-purple-200" /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-purple-200 mb-1">Archivo Recibido</p>
                          <p className="text-xs font-bold truncate max-w-[150px] mb-2">{msg.fileName}</p>
                          <button onClick={() => downloadFile(msg.fileData!, msg.fileName!)} className="text-[10px] font-black flex items-center gap-1 bg-white text-black px-2 py-1 rounded-md hover:bg-purple-200 transition-all"><Download size={10}/> DESCARGAR</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                    <p className="text-[9px] opacity-40 mt-2 text-right font-bold">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/10 flex gap-3">
              <label className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                <Paperclip size={20} className="text-gray-400" />
                <input type="file" onChange={sendFile} className="hidden" disabled={!conn} />
              </label>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Escribe un mensaje..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 outline-none text-sm" />
              <button onClick={sendMessage} disabled={!conn} className="p-4 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50"><Send size={20}/></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}