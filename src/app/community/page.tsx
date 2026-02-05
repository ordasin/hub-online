import { Metadata } from 'next'
import CommunityContent from './CommunityContent'

export const metadata: Metadata = {
  title: "Comunidad | Feedback & Ideas - HUB 903",
  description: "Únete a la comunidad de HUB 903. Comparte tus ideas, reporta fallos y ayuda a dar forma al futuro de nuestras herramientas de optimización y seguridad.",
  alternates: { canonical: '/community/' }
}

export default function CommunityPage() {
  return <CommunityContent />
}
