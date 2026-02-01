import { MessageSquare, Github, Star } from "lucide-react"

interface FeedbackProps {
  projectTitle?: string
}

export function Feedback({ projectTitle }: FeedbackProps) {
  const issueUrl = projectTitle 
    ? `https://github.com/TU_USUARIO/TU_REPO/issues/new?title=Feedback:+${encodeURIComponent(projectTitle)}`
    : `https://github.com/TU_USUARIO/TU_REPO/issues/new`;

  return (
    <div className="mt-16 pt-16 border-t border-white/10">
      <h3 className="text-2xl font-bold text-white mb-8">Interactúa con el Proyecto</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a 
          href={issueUrl}
          target="_blank"
          className="glass p-6 rounded-2xl hover:border-purple-500/50 transition-all group"
        >
          <Github className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h4 className="font-bold text-white text-lg">Dar mi Opinión</h4>
          <p className="text-sm text-gray-400 mt-2">Cuéntame qué te parece {projectTitle || 'el hub'} o sugiere mejoras.</p>
        </a>

        <a 
          href="https://github.com/TU_USUARIO/TU_REPO" // Puedes cambiarlo por Discord
          target="_blank"
          className="glass p-6 rounded-2xl hover:border-blue-500/50 transition-all group"
        >
          <MessageSquare className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
          <h4 className="font-bold text-white text-lg">Chat de la Comunidad</h4>
          <p className="text-sm text-gray-400 mt-2">Únete a la charla y conoce a otros usuarios.</p>
        </a>
      </div>

      {/* Sección de Opiniones Manuales */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center space-x-2 text-yellow-500 mb-4">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-bold uppercase tracking-wider">Opiniones Destacadas</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl italic text-gray-400 text-sm">
            "Esta herramienta me ha ahorrado horas de trabajo. ¡Sigue así!" - Usuario Anónimo
          </div>
        </div>
      </div>
    </div>
  )
}
