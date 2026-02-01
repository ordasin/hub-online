"use client"

import { motion } from "framer-motion"
import { Download, Box, Star } from "lucide-react"

interface ProjectCardProps {
  title: string
  description: string
  version: string
  downloadCount: number
  fileUrl: string
}

export function ProjectCard({ title, description, version, downloadCount, fileUrl }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-purple-400">
            <Box size={24} />
          </div>
          <span className="px-3 py-1 text-xs font-mono bg-white/5 rounded-full text-gray-400 border border-white/10">
            v{version}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Download size={16} />
            <span>{downloadCount.toLocaleString()}</span>
          </div>

          <a 
            href={fileUrl}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
            download
          >
            <span>Download</span>
            <Download size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
