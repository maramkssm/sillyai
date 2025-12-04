"use client"

import { Menu } from "lucide-react"

interface ChatHeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function ChatHeader({ onToggleSidebar, sidebarOpen }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-xl font-semibold text-balance">AI Assistant</h1>
      <div className="w-8" />
    </div>
  )
}
