import { Playfair_Display, Hanken_Grotesk, Geist_Mono } from 'next/font/google'

// Display protagonista: serif editorial de alto contraste.
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
})

// Cuerpo: grotesca humanista, cálida y muy legible. Reemplaza a Inter.
export const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

// Monoespaciada para datos, código y etiquetas técnicas.
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})
