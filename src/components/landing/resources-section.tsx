import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calculator, FileText, HelpCircle, ChevronRight, Info, CheckCircle2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"



export function ResourcesSection() {

  return (
    <section className="py-6">

      {/* FAQ Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-royal-blue mb-2">Preguntas Frecuentes sobre la Formalización</h3>
          <p className="text-muted-foreground text-lg">Resolvemos tus principales dudas con información oficial.</p>
        </div>

        <Card className="border-0 shadow-md max-w-4xl mx-auto bg-card">
          <CardContent className="p-2 sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-border/50">
                <AccordionTrigger className="text-left hover:text-royal-blue transition-colors font-semibold text-lg py-4 px-2">
                  ¿Cuánto cuesta formalizar una empresa en Perú?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-2 pb-4">
                  El costo total oscila entre S/ 500 y S/ 1,500. Esto incluye la reserva de nombre en SUNARP (S/ 24 aprox.), la elaboración de minuta (S/ 150 a S/ 400), gastos notariales (S/ 250 a S/ 700) y gastos registrales.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b-border/50">
                <AccordionTrigger className="text-left hover:text-royal-blue transition-colors font-semibold text-lg py-4 px-2">
                  ¿Existe un capital mínimo obligatorio para empezar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-2 pb-4">
                  No. La ley peruana no exige un monto mínimo obligatorio para constituir una empresa (SAC, EIRL, etc.). El capital puede ser en dinero (efectivo) o en bienes (computadoras, muebles, mercadería) y dependerá de las necesidades reales de tu negocio.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-border/50">
                <AccordionTrigger className="text-left hover:text-royal-blue transition-colors font-semibold text-lg py-4 px-2">
                  ¿El trámite del RUC en la SUNAT tiene algún costo?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-2 pb-4">
                  No, el trámite para obtener y activar tu RUC ante la SUNAT es 100% gratuito. Puedes hacerlo de manera digital vía la App Personas o presencialmente en los Centros de Servicios.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-b-border/50">
                <AccordionTrigger className="text-left hover:text-royal-blue transition-colors font-semibold text-lg py-4 px-2">
                  ¿Cuánto tiempo demora todo el proceso de formalización?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-2 pb-4">
                  El proceso completo, desde la reserva de nombre hasta la obtención de tu RUC activo y Clave SOL, suele tomar entre 3 y 15 días hábiles, dependiendo de la notaría y la carga de los Registros Públicos (SUNARP).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-b-0">
                <AccordionTrigger className="text-left hover:text-royal-blue transition-colors font-semibold text-lg py-4 px-2">
                  ¿Es obligatorio sacar una Licencia de Funcionamiento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base px-2 pb-4">
                  Sí, si vas a operar en un local físico (tienda, oficina, taller). Este trámite se realiza en la municipalidad de tu distrito y su costo varía entre S/ 100 y S/ 400 según el tamaño del local y el nivel de riesgo.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
