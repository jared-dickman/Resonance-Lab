import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Resonance Lab",
  description: "Song library and Ultimate Guitar search interface"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
