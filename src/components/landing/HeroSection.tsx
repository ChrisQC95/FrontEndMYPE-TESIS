import { Button } from "@/components/ui/button"
import { ChevronRight, Store } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-royal-blue via-royal-blue to-sky-blue py-12 lg:py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Formaliza tu Negocio
              <span className="block text-sky-blue/90">
                de Manera Fácil y Rápida
              </span>
            </h1>
            <p className="mt-4 text-pretty text-lg text-white/80 sm:text-xl">
              Convierte tu negocio en formal en pocos pasos.
            </p>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold text-base shadow-lg transition-all hover:shadow-xl hover:scale-105 px-8"
              >
                Ver Guia Rapida
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Store Illustration */}
              <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-6 shadow-2xl">
                <div className="flex flex-col items-center">
                  {/* Awning */}
                  <div className="w-64 sm:w-72">
                    <svg viewBox="0 0 288 40" className="w-full">
                      <defs>
                        <linearGradient id="awning1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                        <linearGradient id="awning2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#f1f5f9" />
                        </linearGradient>
                      </defs>
                      <path d="M0,0 L288,0 L288,20 Q264,40 240,20 Q216,40 192,20 Q168,40 144,20 Q120,40 96,20 Q72,40 48,20 Q24,40 0,20 Z" fill="url(#awning1)" />
                      <path d="M24,0 L24,20 Q48,40 72,20 L72,0 Z" fill="url(#awning2)" />
                      <path d="M72,0 L72,20 Q96,40 120,20 L120,0 Z" fill="url(#awning1)" />
                      <path d="M120,0 L120,20 Q144,40 168,20 L168,0 Z" fill="url(#awning2)" />
                      <path d="M168,0 L168,20 Q192,40 216,20 L216,0 Z" fill="url(#awning1)" />
                      <path d="M216,0 L216,20 Q240,40 264,20 L264,0 Z" fill="url(#awning2)" />
                    </svg>
                  </div>
                  
                  {/* Store front */}
                  <div className="mt-2 w-64 sm:w-72 rounded-lg bg-gradient-to-b from-sky-100 to-sky-50 p-4 shadow-inner">
                    <div className="flex items-end justify-center gap-3">
                      {/* Window/Door */}
                      <div className="h-20 w-16 rounded-t-lg bg-sky-200/60 border-2 border-sky-300" />
                      <div className="h-24 w-12 rounded-t-lg bg-sky-300/60 border-2 border-sky-400" />
                      {/* Products */}
                      <div className="flex flex-col gap-1">
                        <div className="h-8 w-8 rounded bg-red-400 shadow-sm" />
                        <div className="h-10 w-8 rounded bg-yellow-400 shadow-sm" />
                        <div className="h-6 w-8 rounded bg-emerald-400 shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-lg bg-white p-2 shadow-lg">
                  <Store className="h-6 w-6 text-royal-blue" />
                </div>
                <div className="absolute -right-2 -top-2 rounded-full bg-success-green p-2 shadow-lg">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
