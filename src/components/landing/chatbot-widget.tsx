import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Sparkles, User as UserIcon } from "lucide-react"

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'bot' | 'user';
  content: string;
}

// Reemplazar BASE_URL con la configuración real que tengas (por defecto usa la de vite config proxy si existe, o http://localhost:8080)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function ChatbotWidget({ isOpen, onClose }: ChatbotWidgetProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: '¡Hola! Soy tu asistente de formalización FormaEasy. ¿En qué te puedo ayudar hoy?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  
  // Referencia para el auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });

      if (!response.ok) {
        throw new Error('Error en la red al conectar con el asistente.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Lo siento, tuve un problema conectándome a mi servidor. ¿Puedes intentarlo nuevamente en un momento?' }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      {/* Sombra de resplandor (glow) trasera */}
      <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/20 to-sky-400/20 blur-xl opacity-50 rounded-[2rem] -z-10" />

      <Card className="w-80 sm:w-96 shadow-2xl border border-white/40 dark:border-slate-700/50 flex flex-col h-[520px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden rounded-2xl">
        
        {/* Cabecera Premium */}
        <CardHeader className="bg-gradient-to-r from-blue-700 to-sky-600 text-white rounded-t-2xl py-3.5 px-5 flex flex-row items-center justify-between space-y-0 shadow-sm relative overflow-hidden">
          {/* Elemento decorativo */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-wide">Asistente FormaEasy</CardTitle>
              <p className="text-[10px] text-blue-100 font-medium">Entrenamiento MYPE</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-white hover:bg-white/20 hover:text-white rounded-full relative z-10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        {/* Contenido / Chat */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar (Solo para bot) */}
                {msg.role === 'bot' && (
                  <div className="h-6 w-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-1">
                    <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-sky-500 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loader "Escribiendo..." */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="h-6 w-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-1">
                  <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Div invisible para el scroll-to-bottom */}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Footer / Input */}
        <CardFooter className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full items-center gap-2"
          >
            <Input
              type="text"
              placeholder="Escribe aquí tu duda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:ring-1 focus-visible:ring-blue-400 rounded-xl"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
