import type React from "react"

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-black">{children}</div>
}
