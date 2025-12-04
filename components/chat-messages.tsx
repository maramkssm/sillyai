"use client"

import { useEffect, useRef } from "react"
import type { UIMessage } from "ai"
import { Loader2 } from "lucide-react"

interface ChatMessagesProps {
  messages: UIMessage[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto w-full">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="mb-4 text-5xl">💬</div>
          <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-muted-foreground max-w-md">
            Ask me anything! I{"'"}m here to help with questions, ideas, and creative tasks.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-2xl px-4 py-3 rounded-lg ${
              message.role === "user"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-none"
                : "bg-card border border-border text-foreground rounded-bl-none"
            }`}
          >
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <p key={index} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                )
              }
              return null
            })}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-3 rounded-lg rounded-bl-none">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
