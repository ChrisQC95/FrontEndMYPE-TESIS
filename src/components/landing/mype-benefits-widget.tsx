import { Card, CardContent } from "@/components/ui/card"
import { PieChart, HeartPulse, Banknote, Building2, PlaneTakeoff } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"

const tips = [
  {
    icon: PieChart,
    text: "¿Sabías que con el Régimen MYPE Tributario pagas solo el 1% de tus ingresos mensuales si vendes menos de 300 UIT? (UIT 2025 = S/ 5,350)."
  },
  {
    icon: HeartPulse,
    text: "Seguro a mitad de precio: Al registrarte como Microempresa, el Estado subsidia el 50% del SIS para ti y tu equipo."
  },
  {
    icon: Banknote,
    text: "Tus facturas valen oro: Con la Factura Negociable puedes hacer Factoring en bancos y obtener liquidez inmediata."
  },
  {
    icon: Building2,
    text: "El Estado es tu mejor cliente: Las instituciones públicas deben destinar el 40% de sus compras exclusivamente a las MYPE."
  },
  {
    icon: PlaneTakeoff,
    text: "Exportar es fácil: Con Exporta Fácil puedes enviar productos al extranjero mediante Serpost con trámites simplificados."
  }
]

export function MYPEBenefitsWidget() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <div className="sticky top-24 z-10 w-full mb-6 relative">
      <Card className="border border-border shadow-xl bg-card overflow-hidden">
        <div className="bg-royal-blue px-4 py-3 text-center shadow-sm">
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">Tips para tu Negocio</h3>
        </div>
        <CardContent className="p-0">
          <Carousel
            plugins={[plugin.current]}
            className="w-full bg-muted/10"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              loop: true,
              align: "start"
            }}
          >
            <CarouselContent>
              {tips.map((tip, index) => (
                <CarouselItem key={index}>
                  <div className="p-6 md:p-8 flex flex-col items-center text-center gap-5 h-full min-h-[260px] justify-center relative">
                    <div className="h-16 w-16 rounded-2xl bg-vibrant-orange/10 flex items-center justify-center shadow-inner border border-vibrant-orange/20">
                      <tip.icon className="h-8 w-8 text-vibrant-orange" />
                    </div>
                    <p className="text-[15px] text-foreground font-medium leading-relaxed max-w-[250px]">
                      {tip.text}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Controles del Carrusel debajo del texto */}
            <div className="flex justify-center gap-3 pb-5">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border bg-background shadow-sm hover:bg-muted hover:text-royal-blue text-muted-foreground transition-colors" />
              <CarouselNext className="static translate-y-0 h-10 w-10 border-border bg-background shadow-sm hover:bg-muted hover:text-royal-blue text-muted-foreground transition-colors" />
            </div>
          </Carousel>
        </CardContent>
      </Card>
      
      {/* Decorative gradient blur behind the widget */}
      <div className="absolute -z-10 -inset-1 bg-gradient-to-b from-royal-blue/20 to-vibrant-orange/20 blur-xl opacity-50 rounded-[2rem]"></div>
    </div>
  )
}
