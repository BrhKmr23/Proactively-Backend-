import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collaborative Form Editor',
  description: 'A collaborative form editor with Supabase authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 