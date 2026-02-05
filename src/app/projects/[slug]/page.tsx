import { projects } from "@/data/projects"
import { notFound } from "next/navigation"
import { Download, Calendar, ShieldCheck, Zap, ArrowLeft, Globe, Cpu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Feedback } from "@/components/Feedback"
import { Metadata } from "next"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  
  if (!project) return {}

  return {
    title: `${project.title} | HUB 903 Software Hub`,
    description: project.description,
    alternates: {
      canonical: `/projects/${project.slug}/`,
    },
    openGraph: {
      title: `${project.title} - Descarga Segura`,
      description: project.description,
      images: project.images?.[0] ? [{ url: project.images[0] }] : [],
    }
  }
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-12 transition-colors group px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver al catálogo</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest">v{project.version}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><Calendar size={14} /><span>{project.createdAt}</span></div>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">{project.title.toUpperCase()}</h1>
                <p className="text-xl text-gray-400 font-light leading-relaxed">{project.description}</p>
              </div>

              {/* Gallery Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Galería de Capturas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.images?.map((img, i) => (
                    <div key={i} className="aspect-video rounded-[2rem] overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group relative">
                      <Image 
                        src={img} 
                        alt={`${project.title} screenshot ${i}`} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                  ))}
                  {!project.images && (
                    <div className="aspect-video w-full bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
                      <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase">Sin capturas disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-5"><ShieldCheck size={28} className="text-green-400" /><div><h4 className="font-bold text-lg">Verificado</h4><p className="text-sm text-gray-400">Software escaneado y verificado.</p></div></div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-5"><Zap size={28} className="text-blue-400" /><div><h4 className="font-bold text-lg">Rápido</h4><p className="text-sm text-gray-400">Optimizado para alto rendimiento.</p></div></div>
              </div>

              <Feedback projectTitle={project.title} />
            </div>

            <aside className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl sticky top-24 overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[64px]" />
                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Descargas</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{project.downloadCount.toLocaleString()}<span className="text-purple-500 font-light">+</span></p>
                  </div>
                  <a href={project.fileUrl} download className="w-full bg-white text-black hover:bg-purple-500 hover:text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300">
                    <Download size={22} /><span>DESCARGAR</span>
                  </a>
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500 flex items-center gap-2"><Globe size={14}/> Región</span><span className="font-medium">Global</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-500 flex items-center gap-2"><Cpu size={14}/> Sistema</span><span className="font-medium">{(project as any).system || 'Multi'}</span></div>
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
