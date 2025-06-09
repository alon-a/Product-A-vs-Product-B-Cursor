import { AuthProvider } from '@/components/auth/AuthProvider'
import './globals.css'

export const metadata = {
  title: 'Product Comparison Tool',
  description: 'Compare products and get detailed analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
