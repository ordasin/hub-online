import { Metadata } from 'next'
import NexusAIContent from './NexusAIContent'

export const metadata: Metadata = {
  title: "OpenAI 903 | Inteligencia Artificial Avanzada",
  description: "Accede a OpenAI 903, la terminal de inteligencia absoluta sincronizada con GPT-4o para optimización, seguridad y consultas técnicas en tiempo real.",
  alternates: { canonical: '/nexus-ai/' }
}

export default function NexusAIPage() {
  return <NexusAIContent />
}
