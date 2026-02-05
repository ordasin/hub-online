import { Metadata } from 'next'
import FAQContent from './FAQContent'

export const metadata: Metadata = {
  title: "FAQ | Preguntas Frecuentes - HUB 903",
  description: "Obtén respuestas sobre la seguridad de nuestro software, el funcionamiento de la red P2P descentralizada y cómo optimizar tu PC con HUB 903.",
  alternates: { canonical: '/faq/' }
}

export default function FAQPage() {
  return <FAQContent />
}
