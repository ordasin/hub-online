import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">D</div>
        <span className="font-bold tracking-tight text-xl text-white">developer903</span>
      </Link>
      
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          Proyectos
        </Link>
        <Link href="/community" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          Comunidad
        </Link>
        <Link 
          href="https://github.com" 
          target="_blank"
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all"
        >
          GitHub
        </Link>
      </div>
    </nav>
  )
}
