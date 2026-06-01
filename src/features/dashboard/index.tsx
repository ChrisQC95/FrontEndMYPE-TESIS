import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales, VentaReciente } from './components/recent-sales'
import { useAuth } from '@/context/AuthContext'
import { auth } from '@/lib/firebase'
import { Loader2, DollarSign, Receipt, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardData {
  ingresosMesActual: number
  crecimientoIngresos: number
  cantidadVentasMes: number
  totalProductos: number
  totalCategorias: number
  totalSocios: number
  totalVehiculos: number
  totalConductores: number
  ventasRecientes: VentaReciente[]
  graficoVentas: { name: string; total: number }[]
}

export function Dashboard() {
  const { dbUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dbUser?.id) return

    const fetchDashboardData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/resumen?usuarioId=${dbUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Error fetching dashboard')
        const json = await res.json()
        setData(json)
      } catch (error) {
        toast.error('No se pudieron cargar las métricas del dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [dbUser?.id])

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard MYPE</h1>
          <div className='flex items-center space-x-2'>
            <Button>Descargar Reporte</Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            {loading || !data ? (
              <div className='flex h-96 w-full items-center justify-center text-slate-400'>
                <Loader2 className='mr-2 h-8 w-8 animate-spin' />
                Cargando métricas...
              </div>
            ) : (
              <>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Ingresos del Mes
                      </CardTitle>
                      <DollarSign className='h-4 w-4 text-emerald-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        ${data.ingresosMesActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {data.crecimientoIngresos >= 0 ? '+' : ''}
                        {data.crecimientoIngresos.toFixed(1)}% vs mes anterior
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Ventas del Mes
                      </CardTitle>
                      <Receipt className='h-4 w-4 text-blue-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>+{data.cantidadVentasMes}</div>
                      <p className='text-xs text-muted-foreground'>
                        Comprobantes emitidos este mes
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>Catálogo Activo</CardTitle>
                      <Package className='h-4 w-4 text-orange-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{data.totalProductos + data.totalCategorias}</div>
                      <p className='text-xs text-muted-foreground'>
                        {data.totalProductos} Productos y {data.totalCategorias} Categorías
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Operaciones y Logística
                      </CardTitle>
                      <Truck className='h-4 w-4 text-violet-600' />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{data.totalSocios + data.totalVehiculos + data.totalConductores}</div>
                      <p className='text-xs text-muted-foreground'>
                        {data.totalSocios} Socios, {data.totalVehiculos} Vehículos, {data.totalConductores} Conductores
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                  <Card className='col-span-1 lg:col-span-4'>
                    <CardHeader>
                      <CardTitle>Ingresos Últimos 6 Meses</CardTitle>
                    </CardHeader>
                    <CardContent className='ps-2'>
                      <Overview data={data.graficoVentas} />
                    </CardContent>
                  </Card>
                  
                  <Card className='col-span-1 lg:col-span-3'>
                    <CardHeader>
                      <CardTitle>Ventas Recientes</CardTitle>
                      <CardDescription>
                        {data.cantidadVentasMes > 0 
                          ? `Has realizado ${data.cantidadVentasMes} ventas este mes.` 
                          : 'Aún no has realizado ventas este mes.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales ventas={data.ventasRecientes} />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
