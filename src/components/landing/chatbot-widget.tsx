import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Bot } from "lucide-react"

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatbotWidget({ isOpen, onClose }: ChatbotWidgetProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', content: '¡Hola! Soy tu asistente de formalización. ¿En qué te puedo ayudar hoy?' }
  ])
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    // Añade el mensaje del usuario al array de messages
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    // Limpia el input
    setInput('');
    // Cambia isLoading a true
    setIsLoading(true);

    // TODO: Aquí irá el fetch a Spring Boot para que sepamos exactamente dónde conectar la API después.

    // Simular un delay para mostrar el loader de escribiendo...
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 sm:w-96 shadow-2xl border-royal-blue/20 flex flex-col h-[500px]">
        <CardHeader className="bg-royal-blue text-white rounded-t-xl py-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-base font-medium">Asistente Virtual IA</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                    ? 'bg-royal-blue text-white rounded-tr-none'
                    : 'bg-muted text-foreground border border-border shadow-sm rounded-tl-none'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground border border-border shadow-sm rounded-2xl rounded-tl-none px-4 py-2 text-sm flex gap-1 items-center h-9">
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 bg-white border-t rounded-b-xl">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-royal-blue hover:bg-royal-blue/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
