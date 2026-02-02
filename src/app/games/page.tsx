'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, MessageSquare, Send, Sparkles, Lock } from 'lucide-react'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'

interface GameComment {
  id: string
  text: string
  author: string
  time: number
}

export default function GamesPage() {
  const [comments, setComments] = useState<GameComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState<any>(null)
  const [gun, setGun] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initGun = () => {
      // @ts-expect-error Gun via CDN
      const Gun = window.Gun;
      if (!Gun) return;

      const g = Gun(['wss://gun.v6.rocks/gun', 'https://peer.wall.org/gun', 'https://relay.gun.eco/gun']);
      setGun(g);

      // @ts-expect-error Gun types
      const u = g.user().recall({ sessionStorage: true });
      setUser(u);

      // Escuchar comentarios de juegos
      g.get('hub_games_discussion').map().on((data: any, id: string) => {
        if (data && data.text) {
          const cleanData = {
            id,
            text: DOMPurify.sanitize(data.text),
            author: DOMPurify.sanitize(data.author || 'Anon'),
            time: data.time
          };
          setComments(prev => [...prev.filter(c => c.id !== id), cleanData].sort((a, b) => b.time - a.time).slice(0, 50));
        }
      });
    };

    const checker = setInterval(() => {
      // @ts-expect-error Gun via CDN
      if (window.Gun) { initGun(); clearInterval(checker); }
    }, 1000);
    return () => clearInterval(checker);
  }, []);

  const postComment = () => {
    if (!user || !user.is) return toast.error("Debes iniciar sesión para comentar");
    if (!newComment.trim()) return;

    setLoading(true);
    const id = 'MSG_' + Math.random().toString(36).substring(7);
    gun.get('hub_games_discussion').get(id).put({
      text: newComment,
      author: user.is.alias,
      time: Date.now()
    }, (ack: any) => {
      setLoading(false);
      if (!ack.err) {
        setNewComment('');
        toast.success("Opinión compartida en la red P2P");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 px-6 pb-20 font-mono">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(147,51,234,0.3)]">
            <Gamepad2 size={40} />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Zona de <span className="text-purple-500">Juegos</span></h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.3em]">Comunidad, Críticas y Próximos Lanzamientos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Discussion Section */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6 backdrop-blur-xl">
              <h2 className="text-xl font-black uppercase flex items-center gap-3 italic text-purple-400">
                <MessageSquare size={20} /> Debate Gamer P2P
              </h2>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence>
                  {comments.map((c) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-purple-500">{c.author}</span>
                        <span className="text-[8px] text-gray-600">{new Date(c.time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{c.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {comments.length === 0 && (
                  <p className="text-center py-10 text-gray-700 text-xs italic">No hay opiniones todavía. ¡Sé el primero!</p>
                )}
              </div>

              <div className="relative pt-4 border-t border-white/5">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user?.is ? "Escribe tu opinión sobre un juego..." : "Inicia sesión para participar"}
                  disabled={!user?.is || loading}
                  className="w-full h-24 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                />
                <button 
                  onClick={postComment}
                  disabled={!user?.is || loading || !newComment.trim()}
                  className="absolute bottom-8 right-4 p-3 bg-purple-600 rounded-xl hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send size={16} />
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar / Upload Placeholder */}
          <aside className="space-y-8">
            <section className="p-8 rounded-[3rem] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 space-y-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <h2 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-500" /> Repositorio
              </h2>
              
              <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                  <Lock size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase leading-loose">
                  Módulo de carga de juegos <br /> temporalmente restringido.
                </p>
                <div className="text-[8px] text-gray-700 font-bold bg-white/5 py-2 px-4 rounded-full">
                  SOLO MASTER DEVELOPER
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 italic leading-relaxed">
                Próximamente podrás subir tus propios desarrollos directamente a la red HUB 903.
              </p>
            </section>

            <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10">
              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest">Próximos Títulos</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Ordasin Conquest Web
                </li>
                <li className="flex items-center gap-3 text-xs text-gray-400 opacity-50">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" /> CyberQuest RPG
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(147, 51, 234, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(147, 51, 234, 0.5); }
      `}</style>
    </main>
  )
}
