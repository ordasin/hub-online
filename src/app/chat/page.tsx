'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Copy, Link as LinkIcon, MessageSquare, Paperclip, FileText, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

export default function ChatPage() {
  const [peer, setPeer] = useState<any>(null)
  const [myId, setMyId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [conn, setConn] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Iniciando...')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = () => {
      // @ts-ignore
      const Gun = window.Gun;
      // @ts-ignore
      const Peer = window.Peer;
      if (!Gun || !Peer) return;

      const g = Gun({ peers: ['https://relay.gun.eco/gun'] });
      const newPeer = new Peer();

      newPeer.on('open', (id: string) => {
        setPeer(newPeer);
        setMyId(id);
        setStatus('Listo');
        g.get('online_users').get(id).put(Date.now());
      });

      newPeer.on('connection', (connection: any) => {
        setupConnection(connection);
      });
    };

    const setupConnection = (connection: any) => {
      connection.on('open', () => {
        setConn(connection);
        setStatus('Conectado');
        toast.success("Vínculo P2P establecido");
      });

      connection.on('data', (data: any) => {
        if (data.isFile) {
          setMessages(prev => [...prev, { sender: 'Peer', time: new Date().toLocaleTimeString(), isFile: true, fileName: data.fileName, fileData: data.fileData }]);
        } else {
          setMessages(prev => [...prev, { sender: 'Peer', text: DOMPurify.sanitize(data.text || ""), time: new Date().toLocaleTimeString() }]);
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-ignore
      if (window.Gun && window.Peer) {
        init();
        clearInterval(checker);
      }
    }, 1000);
    return () => clearInterval(checker);
  }, []);

  const sendMessage = () => {
    if (conn && input.trim()) {
      const msg = { text: input, time: new Date().toLocaleTimeString() };
      conn.send(msg);
      setMessages(prev => [...prev, { sender: 'Tú', ...msg }]);
      setInput('');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
            <h2 className="text-xl font-black mb-4 uppercase italic">Tu Nodo</h2>
            <code className="text-[10px] text-purple-400 block p-4 bg-black rounded-xl border border-white/5 truncate mb-4">{myId || 'Generando...'}</code>
            <button onClick={() => { navigator.clipboard.writeText(myId); toast.info("Copiado"); }} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase">Copiar ID</button>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
            <h2 className="text-xl font-black mb-4 uppercase italic">Conectar</h2>
            <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="ID Destino..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs outline-none mb-4" />
            <button onClick={() => peer?.connect(targetId)} className="w-full py-4 bg-purple-600 rounded-xl font-black text-xs">ENLAZAR</button>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="h-[600px] flex flex-col bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase">Canal Directo</h3>
                <span className="text-[10px] text-gray-500 font-black">{status}</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'Tú' ? 'bg-purple-600' : 'bg-white/10 border border-white/5'}`}>
                    {msg.isFile ? <p className="text-xs">Archivo: {msg.fileName}</p> : <p className="text-sm">{msg.text}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/10 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Mensaje..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 outline-none text-sm" />
              <button onClick={sendMessage} className="p-4 bg-purple-600 rounded-xl"><Send size={20}/></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}