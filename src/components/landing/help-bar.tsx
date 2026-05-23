import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { ChatbotWidget } from "./chatbot-widget"

export function HelpBar() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <section id="ayuda" className="bg-gradient-to-r from-royal-blue to-sky-blue py-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg">Asistente Virtual IA</span>
              <span className="mx-3 hidden sm:inline text-white/60">|</span>
              <span className="block text-sm text-white/90 sm:inline">
                Resuelve tus dudas sobre SUNAT, SUNARP y formalización al instante.
              </span>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-card hover:bg-card/90 text-royal-blue font-bold shadow-lg px-6"
            onClick={() => setIsChatOpen(true)}
          >
            <Bot className="mr-2 h-5 w-5" />
            Abrir Chatbot
          </Button>
        </div>
      </section>

      <ChatbotWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}
