import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quovarine - Autonomous Workflow Automation',
  description: 'An autonomous system designed to automate and streamline administrative workflows',
  keywords: ['automation', 'workflow', 'AI', 'autonomous', 'administrative'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  )
}
