'use client'

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

const PEERS = ['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun'];

export default function ChatPage() {
  const [gun, setGun] = useState<unknown>(null)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [targetId, setTargetId] = useState('')

  useEffect(() => {
    const init = () => {
      // @ts-expect-error Gun is loaded via CDN
      const Gun = window.Gun;
      if (!Gun || !Gun.SEA) return;

      const g = Gun({ peers: PEERS, localStorage: true });
      setGun(g);
      
      const u = g.user().recall({ sessionStorage: true });
      setUser(u);

      if (u.is) {
        g.get('direct_messages').get(u.is.pub).map().on((data: Record<string, unknown>, id: string) => {
          if (data) setMessages(prev => [...prev.filter(m => m.id !== id), { ...data, id }]);
        });
      }
    };

    const loader = setInterval(() => {
      // @ts-expect-error Gun is loaded via CDN
      if (window.Gun && window.Gun.SEA) { init(); clearInterval(loader); }
    }, 1000);
    return () => clearInterval(loader);
  }, [])

  const sendMessage = () => {
    if (!gun || !user.is || !input || !targetId) return toast.error("Faltan datos");
    
    const msg = {
      text: input,
      from: user.is.alias,
      time: Date.now()
    };

    gun.get('direct_messages').get(targetId).set(msg);
    gun.get('direct_messages').get(user.is.pub).set(msg);
    setInput('');
    toast.success("Mensaje enviado");
  }

  if (!user?.is) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono uppercase text-[10px]">Debes iniciar sesión para chatear</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 font-mono">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
          <h2 className="font-black uppercase italic text-sm text-purple-500">Canal Seguro</h2>
          <div>
            <p className="text-[8px] text-gray-500 mb-2 uppercase tracking-widest font-black">Tu ID Púbica</p>
            <code className="text-[8px] text-gray-400 break-all bg-black p-3 rounded-xl block border border-white/5">{user.is.pub}</code>
          </div>
          <input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="ID Destino..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs outline-none mb-4" />
        </aside>

        <div className="md:col-span-2 flex flex-col h-[600px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.sort((a,b) => a.time - b.time).map(m => (
              <div key={m.id} className={`flex flex-col ${m.from === user.is.alias ? 'items-end' : 'items-start'}`}>
                <div className="max-w-[80%] p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[8px] font-black uppercase text-purple-500 mb-1">{m.from}</p>
                  <p className="text-sm text-gray-300">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-black/50 border-t border-white/10 flex gap-4">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Mensaje..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 outline-none text-sm" />
            <button onClick={sendMessage} className="p-4 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all"><Send size={20}/></button>
          </div>
        </div>
      </div>
    </main>
  )
}
