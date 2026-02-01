import { MessageSquare, Github, Star, Sparkles, Send, MessageCircle } from "lucide-react"

interface FeedbackProps {
  projectTitle?: string
}

export function Feedback({ projectTitle }: FeedbackProps) {
  const repoUrl = "https://github.com/ordasin/hub-online";
  const discordUrl = "https://discord.gg/dehYH7AQ";
  const issueUrl = projectTitle 
    ? `${repoUrl}/issues/new?title=Feedback:+${encodeURIComponent(projectTitle)}`
    : `${repoUrl}/issues/new`;

  return (
    <div className="mt-24 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href={issueUrl}
          target="_blank"
          className="relative group overflow-hidden p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
            <Github size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Send size={24} />
            </div>
            <h4 className="font-black text-white text-xl mb-2 uppercase tracking-tight">Reportar o Sugerir</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              ¿Has encontrado un error o tienes una idea para {projectTitle || 'el Hub'}? Ábrelo en GitHub.
            </p>
          </div>
        </a>

        <a 
          href={discordUrl}
          target="_blank"
          className="relative group overflow-hidden p-8 rounded-[2rem] bg-[#5865F2]/5 border border-[#5865F2]/10 hover:border-[#5865F2]/50 transition-all"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity text-[#5865F2]">
            <MessageCircle size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#5865F2]/10 rounded-xl flex items-center justify-center text-[#5865F2] mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h4 className="font-black text-white text-xl mb-2 uppercase tracking-tight">Comunidad Discord</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Únete a nuestro servidor de Discord para soporte en tiempo real y charlas con otros usuarios.
            </p>
          </div>
        </a>
      </div>

      {/* Sección de Opiniones */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 text-yellow-500 mb-8">
          <Star size={20} fill="currentColor" />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Testimonios Reales</span>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="relative p-6 rounded-2xl bg-white/5 border-l-4 border-purple-500">
            <p className="text-gray-300 italic text-lg leading-relaxed">
              "El optimizador de Ordasin ha cambiado por completo el rendimiento de mis aplicaciones. 
              La interfaz es intuitiva y extremadamente rápida."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
              <span className="text-sm font-bold text-white">Usuario Verificado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
