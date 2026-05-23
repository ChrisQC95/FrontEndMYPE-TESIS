import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MonitorSmartphone, 
  Building2, 
  Download, 
  Fingerprint, 
  CheckCircle2, 
  Clock,
  IdCard,
  MapPin,
  FileText,
  Info,
  User,
  PieChart,
  Receipt,
  Trophy,
  ExternalLink,
  Route
} from "lucide-react"

export function RequirementsTabs() {
  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-royal-blue mb-4">
          Requisitos de Formalización (RUC)
        </h2>
        <p className="text-muted-foreground text-lg">
          Conoce el proceso para obtener tu RUC de 11 dígitos según el tipo de trámite en la SUNAT.
        </p>
      </div>

      <Tabs defaultValue="digital" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="digital" className="text-base">
            <MonitorSmartphone className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Inscripción Digital</span>
            <span className="sm:hidden">Digital</span>
          </TabsTrigger>
          <TabsTrigger value="presencial" className="text-base">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Inscripción Presencial</span>
            <span className="sm:hidden">Presencial</span>
          </TabsTrigger>
          <TabsTrigger value="ruta" className="text-base">
            <Route className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ruta de Formalización</span>
            <span className="sm:hidden">Ruta</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="digital">
          <Card className="border-0 shadow-md">
            <CardHeader className="text-center sm:text-left">
              <CardTitle className="text-xl text-royal-blue">Flujo de Inscripción vía SUNAT Virtual</CardTitle>
              <CardDescription>
                Proceso 100% online disponible <strong className="text-foreground">24/7</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative flex flex-col items-center p-6 text-center border rounded-xl bg-card transition-colors hover:border-royal-blue/30">
                  <div className="absolute -top-3 -right-3 bg-royal-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">1</div>
                  <Download className="w-10 h-10 mb-4 text-royal-blue" />
                  <h4 className="font-semibold mb-2">App Personas SUNAT</h4>
                  <p className="text-sm text-muted-foreground">Descarga la aplicación oficial desde tu tienda móvil.</p>
                </div>
                <div className="relative flex flex-col items-center p-6 text-center border rounded-xl bg-card transition-colors hover:border-royal-blue/30">
                  <div className="absolute -top-3 -right-3 bg-royal-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">2</div>
                  <Fingerprint className="w-10 h-10 mb-4 text-royal-blue" />
                  <h4 className="font-semibold mb-2">Identidad Biométrica</h4>
                  <p className="text-sm text-muted-foreground">Valida tu identidad mediante reconocimiento facial (biometría dactilar).</p>
                </div>
                <div className="relative flex flex-col items-center p-6 text-center border rounded-xl bg-card border-success-green/20 hover:border-success-green/40 transition-colors">
                  <div className="absolute -top-3 -right-3 bg-success-green text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">3</div>
                  <Clock className="w-10 h-10 mb-4 text-success-green" />
                  <h4 className="font-semibold mb-2">Registrar Datos y Clave</h4>
                  <p className="text-sm text-muted-foreground">Declara tu actividad, domicilio fiscal y genera tu Clave SOL al instante.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presencial">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-royal-blue">Documentos Necesarios</CardTitle>
                <CardDescription>Preséntate en cualquier Centro de Servicios al Contribuyente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col justify-center">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/40">
                  <div className="flex bg-success-green/10 p-2 rounded-full shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">DNI Vigente</h4>
                    <p className="text-sm text-muted-foreground">Documento Nacional de Identidad en formato físico.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/40">
                  <div className="flex bg-success-green/10 p-2 rounded-full shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Sustento de Domicilio</h4>
                    <p className="text-sm text-muted-foreground">Recibo de luz, agua o contrato de alquiler (obligatorio si la dirección difiere del DNI).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/40">
                  <div className="flex bg-success-green/10 p-2 rounded-full shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-success-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Carta Poder Legalizada</h4>
                    <p className="text-sm text-muted-foreground">Solo requerido si el trámite es realizado por un tercero en tu representación.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md flex flex-col justify-center bg-royal-blue/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-royal-blue">
                  <Building2 className="w-5 h-5" />
                  Persona Jurídica (Empresas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-background border-primary/20 shadow-sm">
                  <Info className="h-5 w-5 text-royal-blue" />
                  <AlertTitle className="text-royal-blue font-semibold ml-2">Flujo SID-SUNARP</AlertTitle>
                  <AlertDescription className="text-sm mt-3 ml-2 flex flex-col gap-3">
                    <span className="flex gap-2"><strong className="text-royal-blue">1.</strong> Constitución e inscripción en Registros Públicos vía plataforma SID-SUNARP.</span>
                    <span className="flex gap-2"><strong className="text-royal-blue">2.</strong> Activación automática de RUC inactivo por parte de SUNAT.</span>
                    <span className="flex gap-2"><strong className="text-royal-blue">3.</strong> Generación de Clave SOL y reactivación formal del RUC de la empresa por el representante legal.</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ruta">
          <Card className="border-0 shadow-md">
            <CardHeader className="text-center sm:text-left">
              <CardTitle className="text-xl text-royal-blue">Tu Ruta hacia la Formalidad</CardTitle>
              <CardDescription>
                Sigue estos 5 pasos clave para formalizar tu negocio y acceder a todos sus beneficios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-dashed border-slate-200 ml-4 md:ml-6 space-y-10 pb-4 mt-4">
                {/* Paso 1 */}
                <div className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-royal-blue shadow-sm">
                    <User className="h-5 w-5 text-royal-blue" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-royal-blue border-royal-blue/30 bg-royal-blue/5">
                        Paso 1
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">Define tu Identidad</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Decide si operarás como Persona Natural con Negocio (rápido, a título personal) o Persona Jurídica (empresa formal como SAC o EIRL). Esto determinará tu nivel de responsabilidad y posibilidades de financiamiento.
                    </p>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-royal-blue shadow-sm">
                    <IdCard className="h-5 w-5 text-royal-blue" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-royal-blue border-royal-blue/30 bg-royal-blue/5">
                        Paso 2
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">Obtén tu RUC y Clave SOL</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      El RUC es tu identificador de 11 dígitos. Las Personas Naturales pueden sacarlo 24/7 vía la App Personas SUNAT con validación biométrica. Las Personas Jurídicas deben hacerlo mediante el SID-SUNARP y luego activar su Clave SOL.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="https://personas.sunat.gob.pe/" target="_blank" rel="noopener noreferrer">
                          App Personas SUNAT <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="https://www.sunarp.gob.pe/w-sid/index.html" target="_blank" rel="noopener noreferrer">
                          Portal SID-SUNARP <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-royal-blue shadow-sm">
                    <PieChart className="h-5 w-5 text-royal-blue" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-royal-blue border-royal-blue/30 bg-royal-blue/5">
                        Paso 3
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">Elige tu Régimen Tributario</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Determina qué impuestos pagarás según tus ingresos proyectados. Puedes elegir entre: Nuevo RUS (solo emite boletas), Régimen Especial (RER), Régimen MYPE Tributario (ideal para crecimiento) o Régimen General.
                    </p>
                  </div>
                </div>

                {/* Paso 4 */}
                <div className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-royal-blue shadow-sm">
                    <Receipt className="h-5 w-5 text-royal-blue" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-royal-blue border-royal-blue/30 bg-royal-blue/5">
                        Paso 4
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">Comprobantes Electrónicos</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Habilita tu sistema de facturación. Como empresa formal, debes emitir Boletas y Facturas Electrónicas para todas tus ventas. Puedes usar el facturador gratuito de SUNAT o un ERP personalizado.
                    </p>
                  </div>
                </div>

                {/* Paso 5 */}
                <div className="relative pl-8 md:pl-10">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-success-green shadow-sm">
                    <Trophy className="h-5 w-5 text-success-green" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-success-green border-success-green/30 bg-success-green/5">
                        Paso 5
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">Cumplimiento y Beneficios</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Declara tus impuestos mensualmente. Al ser formal, la información se cruza automáticamente en el sistema financiero, abriéndote las puertas a créditos bancarios y permitiéndote venderle al Estado.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Button variant="outline" size="sm" className="gap-2 border-success-green/50 hover:bg-success-green/10 hover:text-success-green hover:border-success-green text-success-green" asChild>
                        <a href="https://www.gob.pe/osce" target="_blank" rel="noopener noreferrer">
                          Oportunidades OSCE <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="text-xl font-bold text-royal-blue mb-4">¿Quiénes están obligados a inscribirse?</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline hover:text-royal-blue transition-colors text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-royal-blue shrink-0" />
                <span className="font-medium">Existen actividades económicas vinculadas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base ml-8">
              Si desarrollas actividades comerciales, industriales o prestas servicios de manera independiente y habitual que te generen ingresos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="hover:no-underline hover:text-royal-blue transition-colors text-left">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-royal-blue shrink-0" />
                <span className="font-medium">Poseedores de múltiples inmuebles</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base ml-8">
              Estás obligado si eres propietario de más de dos bienes inmuebles y percibes ingresos constantes por su respectivo arrendamiento o subarriendo.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="hover:no-underline hover:text-royal-blue transition-colors text-left">
              <div className="flex items-center gap-3">
                <IdCard className="w-5 h-5 text-royal-blue shrink-0" />
                <span className="font-medium">Movimientos financieros elevados</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base ml-8">
              Si realizas movimientos bancarios consistentes, mantienes cuentas con saldos importantes o solicitas créditos comerciales considerables sin poder sustentar una actividad económica habitual formal.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
