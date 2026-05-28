import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuth } from '@/context/AuthContext'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { dbUser, empresaPerfil } = useAuth()

  // Combinamos los datos estáticos con los datos reales del usuario/empresa
  const dynamicTeams = [
    {
      ...sidebarData.teams[0],
      name: empresaPerfil?.razonSocial || dbUser?.razonSocial || sidebarData.teams[0].name,
      logoUrl: empresaPerfil?.logoUrl || undefined,
    },
    ...sidebarData.teams.slice(1),
  ]

  const dynamicUser = {
    ...sidebarData.user,
    name: dbUser?.razonSocial || dbUser?.email?.split('@')[0] || sidebarData.user.name,
    email: dbUser?.email || sidebarData.user.email,
    avatar: empresaPerfil?.logoUrl || sidebarData.user.avatar,
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={dynamicTeams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
