import './globals.css'
import { Schibsted_Grotesk } from 'next/font/google'
import Script from 'next/script'
import Footer from '@/components/layout/Footer'

const grotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: 'Jacob Joergens',
  description: 'Personal Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Script id='katex'>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"/>
      </Script>
      <body className={grotesk.className}>
        {children}
      </body>
    </html>
  )
}
