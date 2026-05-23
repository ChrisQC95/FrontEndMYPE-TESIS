import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShieldCheck, Rocket, HeartPulse, CheckCircle2 } from "lucide-react"

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-blue-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            ¿Por qué formalizar tu MYPE hoy?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Descubre las ventajas exclusivas de operar en la formalidad y haz crecer tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* Tarjeta 1 */}
          <Card className="bg-white border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Ventajas Financieras y Tributarias</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Liquidez inmediata con Factura Negociable.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Recuperación anticipada del IGV en compras/exportaciones.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Crédito tributario por capacitar a tu personal.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tarjeta 2 */}
          <Card className="bg-white border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Compras Estatales</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">El Estado reserva el 40% de sus compras para las MYPE.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Facilidades para presentar garantías en contratos públicos.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tarjeta 3 */}
          <Card className="bg-white border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <Rocket className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Crecimiento Ágil</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Constitución 100% online vía SID-SUNARP.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Acceso rápido a mercados internacionales con Exporta Fácil.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tarjeta 4 */}
          <Card className="bg-white border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <HeartPulse className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Protección Laboral y Salud</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Cobertura de salud (SIS) subsidiada al 50% por el Estado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green mt-0.5" />
                  <span className="text-muted-foreground">Acompañamiento del Ministerio de Trabajo sin multas inmediatas.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}
