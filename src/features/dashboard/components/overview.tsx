import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

export interface GraficoVentaData {
  name: string
  facturas: number
  boletas: number
  notasVenta: number
  total: number
}

interface OverviewProps {
  data: GraficoVentaData[]
}

const pen = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1.5 min-w-[180px]">
      <p className="font-bold text-sm text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.fill }} className="font-medium">{p.name}</span>
          <span className="font-mono text-foreground">{pen(p.value)}</span>
        </div>
      ))}
      <div className="border-t pt-1.5 flex justify-between">
        <span className="font-semibold text-foreground">Total</span>
        <span className="font-mono font-bold text-foreground">
          {pen(payload.reduce((s: number, p: any) => s + p.value, 0))}
        </span>
      </div>
    </div>
  )
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(150, 150, 150, 0.12)' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
        />
        <Bar dataKey="facturas" name="Facturas"    stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="boletas"  name="Boletas"     stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="notasVenta" name="Notas de Venta" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
