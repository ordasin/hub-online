import { projects } from "@/data/projects"
import { notFound } from "next/navigation"
import { Download, Calendar, ShieldCheck, Zap, ArrowLeft, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { Feedback } from "@/components/Feedback"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

// ... existing generateStaticParams ...

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)

  if (!project) notFound()

  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al catálogo</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold text-white">{project.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
                  Version {project.version}
                </span>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{project.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Screenshots Placeholder */}
            <div className="aspect-video w-full glass rounded-3xl flex items-center justify-center border-dashed border-2 border-white/10 group hover:border-purple-500/50 transition-colors">
              <div className="text-center space-y-2">
                <ImageIcon size={48} className="mx-auto text-gray-600 group-hover:text-purple-400 transition-colors" />
                <p className="text-gray-500">Capturas de pantalla próximamente</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-white text-2xl font-bold mb-4">Sobre este proyecto</h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </div>
            
            <Feedback projectTitle={project.title} />
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="glass p-4 rounded-xl flex items-start space-x-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Seguro</h4>
                  <p className="text-sm text-gray-400">Escaneado y verificado.</p>
                </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-start space-x-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Rápido</h4>
                  <p className="text-sm text-gray-400">Código de alto rendimiento.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl sticky top-24 border-purple-500/20">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400 mb-1">Downloads</p>
                <p className="text-3xl font-bold text-white">{project.downloadCount.toLocaleString()}+</p>
              </div>

              <a 
                href={project.fileUrl}
                download
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <Download size={20} />
                <span>Descargar (.zip)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}