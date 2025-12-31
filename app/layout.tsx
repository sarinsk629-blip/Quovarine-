import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quovarine - Claude 4.5 Opus Integration',
  description: 'Hexagonal Architecture AI integration with Extended Thinking',
  keywords: ['claude', 'opus', 'ai', 'hexagonal-architecture', 'self-healing'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-white antialiased">{children}</body>
    </html>
  );
}
