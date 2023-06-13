import './globals.css'
import { Schibsted_Grotesk } from 'next/font/google'
import Link from 'next/link'

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
      <body className={grotesk.className}>
        {children}
      </body>
    </html>
  )
}
