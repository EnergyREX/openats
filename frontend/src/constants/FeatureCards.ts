import { FileSearch, Gauge, ServerCog } from "lucide-react";

export const FEATURECARDS = [
  {
    icon: FileSearch,
    title: 'Parsing de CVs con IA',
    description:
      'Cada candidatura se procesa automáticamente: extraemos experiencia, skills y contacto del CV sin trabajo manual.',
  },
  {
    icon: Gauge,
    title: 'Scoring de candidatos',
    description:
      'Cada candidato recibe una puntuación frente a los requisitos de la oferta para priorizar la revisión.',
  },
  {
    icon: ServerCog,
    title: 'Open source y self-hosted',
    description:
      'Despliégalo en tu propia infraestructura. Tus datos de candidatos nunca salen de tu servidor.',
  },
]