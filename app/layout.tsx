import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quovarine - Claude 4.5 Opus Integration',
  description: 'Hexagonal Architecture AI integration with Extended Thinking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
