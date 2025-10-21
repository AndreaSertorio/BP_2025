import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DatabaseProvider } from '@/contexts/DatabaseProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eco 3D - Piano Finanziario Interattivo',
  description: 'Dashboard interattiva per la visualizzazione e modifica degli scenari finanziari di Eco 3D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <DatabaseProvider>
          <ToastProvider />
          {children}
        </DatabaseProvider>
      </body>
    </html>
  )
}
