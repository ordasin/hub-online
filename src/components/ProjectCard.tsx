"use client"

import { motion } from "framer-motion"
import { Download, Box, ArrowUpRight, Cpu } from "lucide-react"

interface ProjectCardProps {
  title: string
  description: string
  version: string
  downloadCount: number
  fileUrl: string
}

export function ProjectCard({ title, description, version, downloadCount, fileUrl }: ProjectCardProps) {
  return (
    <div className="relative group p-[1px] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
      {/* Efecto de luz al pasar el ratón */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 bg-[#0a0a0a] rounded-[2rem] p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-500">
            <Cpu size={28} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/20">
              v{version}
            </span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Download size={12} />
              <span className="text-xs font-bold">{downloadCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors leading-tight">
          {title.toUpperCase()}
        </h3>
        
        <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Ready to Deploy
          </span>
          <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:translate-x-1 transition-transform">
            Ver detalles <ArrowUpRight size={16} className="text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}