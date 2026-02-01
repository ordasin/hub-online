import { projects } from "@/data/projects"
import { notFound } from "next/navigation"
import { Download, Calendar, ShieldCheck, Zap, ArrowLeft, Image as ImageIcon, Sparkles, Globe, Cpu } from "lucide-react"
import Link from "next/link"
import { Feedback } from "@/components/Feedback"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)

  if (!project) notFound()

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Fondo con efectos */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Volver */}
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-12 transition-colors group px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Volver al catálogo</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest">
                    v{project.version}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar size={14} />
                    <span>Publicado el {project.createdAt}</span>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                  {project.title.toUpperCase()}
                </h1>
                
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Screenshots Placeholder */}
              <div className="aspect-video w-full bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 overflow-hidden group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-center space-y-4 relative z-10">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon size={32} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <p className="text-gray-500 font-medium tracking-wide text-center uppercase">Capturas de pantalla próximamente</p>
                </div>
              </div>

              {/* Características */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-5 hover:bg-white/10 transition-colors">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Verificado</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Este software ha sido escaneado y verificado para su uso seguro.</p>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-5 hover:bg-white/10 transition-colors">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Alto Rendimiento</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">Optimizado al máximo para no consumir recursos innecesarios.</p>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-white/5">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Sparkles className="text-purple-400" />
                  Opiniones de Usuarios
                </h3>
                <Feedback projectTitle={project.title} />
              </div>
            </div>

            {/* Sidebar de Descarga */}
            <aside className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl sticky top-24 overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[64px]" />
                
                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Descargas</p>
                    <p className="text-5xl font-black text-white tracking-tighter">
                      {project.downloadCount.toLocaleString()}
                      <span className="text-purple-500 text-3xl font-light">+</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <a 
                      href={project.fileUrl}
                      download
                      className="w-full bg-white text-black hover:bg-purple-500 hover:text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 transform group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                    >
                      <Download size={22} />
                      <span className="text-lg">DESCARGAR (.ZIP)</span>
                    </a>
                    <p className="text-center text-[10px] text-gray-600 font-bold tracking-widest uppercase">
                      Servidor Seguro Ordasin
                    </p>
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-2"><Globe size={14}/> Región</span>
                      <span className="text-white font-medium">Global</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 flex items-center gap-2"><Cpu size={14}/> Plataforma</span>
                      <span className="text-white font-medium">Windows 10/11</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}