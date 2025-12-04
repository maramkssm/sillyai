"use client"

import { useState, useCallback } from "react"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  parts: Array<{ type: "text"; text: string }>
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sendToAPI = async (allMessages: Message[]) => {
    setIsLoading(true)

    try {
      // Prepare messages for API
      const apiMessages = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      console.log("📨 Sending to API:", apiMessages)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let aiResponse = ""

      // Collect entire response
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiResponse += decoder.decode(value)
      }

      if (aiResponse.trim()) {
        console.log("✅ Complete AI Response:", aiResponse)

        // Add complete message to chat
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
          parts: [{ type: "text", text: aiResponse }],
        }

        setMessages((prev) => [...prev, assistantMsg])
      }
    } catch (error) {
      console.error("❌ Error:", error)

      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
        parts: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
          },
        ],
      }

      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = useCallback(
    (message: { text: string }) => {
      const userMessage = message.text.trim()

      if (!userMessage || isLoading) return

      console.log("📤 User Message:", userMessage)

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        parts: [{ type: "text", text: userMessage }],
      }

      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      sendToAPI(updatedMessages)
    },
    [isLoading, messages]
  )

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="w-64 border-r border-border bg-card p-4 hidden md:block">
          <div className="text-sm text-muted-foreground">
            <p className="mb-4 font-semibold">Chat History</p>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors text-sm">
                New Chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <ChatHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}