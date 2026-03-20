import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { TableOfContents, LayoutDashboard, Activity, FileSpreadsheet } from "lucide-react";
import { useCurrentReport } from "@/lib/current-report-context";

const navItems = [
  { title: "Production Reports", url: "/reports", icon: TableOfContents },
  { title: "Dashboard", url: "/", icon: LayoutDashboard }
];

export function AppSidebar() {
  const [location] = useLocation();
  const { reportId } = useCurrentReport();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <div>
          <strong className="text-xl font-xl">BWI MES</strong>
        </div>
      </SidebarHeader>
      {reportId && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-4 mb-1">
                Current Report
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location === `/reports/${reportId}`}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={`/reports/${reportId}`} title={`Report: ${reportId}`}>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="truncate">{reportId}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-4 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url) && !location.startsWith("/reports/"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-xs text-sidebar-foreground/50">API: https://localhost:8443</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
