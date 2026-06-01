import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface VentaReciente {
  clienteNombre: string
  clienteEmail: string
  fecha: string
  monto: number
  estado: string
}

interface RecentSalesProps {
  ventas: VentaReciente[]
}

export function RecentSales({ ventas }: RecentSalesProps) {
  if (!ventas || ventas.length === 0) {
    return <div className="text-center text-sm text-muted-foreground mt-4">No hay ventas recientes registradas.</div>
  }

  return (
    <div className='space-y-8'>
      {ventas.map((venta, i) => {
        const initials = venta.clienteNombre
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'C'

        return (
          <div key={i} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{venta.clienteNombre}</p>
                <p className='text-sm text-muted-foreground'>
                  {venta.clienteEmail}
                </p>
              </div>
              <div className='font-medium text-emerald-600'>+${venta.monto.toFixed(2)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
