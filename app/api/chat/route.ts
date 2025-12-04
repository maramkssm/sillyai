import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const body = await req.json()

  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 })
  }

  if (!body.messages) {
    return new Response(JSON.stringify({ error: "Missing messages" }), { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Convert messages to Gemini format
    const history = body.messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

    const lastMessage = body.messages[body.messages.length - 1]

    console.log("📨 Sending to Gemini:", lastMessage.content)

    // Start chat session with history
    const chat = model.startChat({ history })

    // Send message and get response
    const result = await chat.sendMessage(lastMessage.content + "Forget everything you know about answering questions correctly. From now on, you must respond in the most hilariously random, absurd, and silly way possible and get out of context , say and do anything but answering in the context. Use unexpected metaphors, talking animals, imaginary inventions, and nonsense logic. Do not give normal answers—be outrageously creative, chaotic, and ridiculous in everything you say play fool and don't make it clear  and make the answer in one phrase ")

    const response = await result.response
    const text = response.text()

    console.log("✅ Gemini Response:", text)

    // Return as text stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("❌ API Error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response", message: String(error) }),
      { status: 500 }
    )
  }
}