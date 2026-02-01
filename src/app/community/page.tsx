import { Feedback } from "@/components/Feedback"
import { Users, MessageSquare, Shield } from "lucide-react"

export default function CommunityPage() {
  return (
    <main className="min-h-screen relative py-32 px-6">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-extrabold text-white">Comunidad Hub</h1>
          <p className="text-xl text-gray-400">
            Un espacio interno para hablar, dar feedback y compartir ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-white">Libertad</h3>
            <p className="text-sm text-gray-400">Opina libremente sobre mis herramientas.</p>
          </div>
          <div className="glass p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mx-auto">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-white">Comunidad</h3>
            <p className="text-sm text-gray-400">Conoce a otros usuarios del hub.</p>
          </div>
          <div className="glass p-6 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mx-auto">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-white">Directo</h3>
            <p className="text-sm text-gray-400">Sin intermediarios, feedback para mí.</p>
          </div>
        </div>

        <Feedback />
      </div>
    </main>
  )
}
