import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Form' }

// This layout exists solely to export metadata for the 'use client' page below.
// Next.js cannot export metadata from client components.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
