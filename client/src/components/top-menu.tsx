import { Link, useLocation } from "wouter";
import { TableOfContents, LayoutDashboard, FileSpreadsheet, Layers } from "lucide-react";
import { useCurrentReport } from "@/lib/current-report-context";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Production Reports", url: "/reports", icon: TableOfContents },
  { title: "ANDON", url: "/reports", icon: Layers },
  { title: "SCRAP", url: "/reports", icon: FileSpreadsheet }
];

export function TopMenu() {
  const [location] = useLocation();
  const { reportId } = useCurrentReport();

  return (
    <nav className="flex items-center w-full">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {navItems.map((item) => {
          const isActive =
            location === item.url ||
            (item.url !== "/" &&
              location.startsWith(item.url) &&
              !location.startsWith("/reports/"));

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* RIGHT */}
      {reportId && (
        <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs uppercase text-muted-foreground">
              Current
            </span>
          <Link
            href={`/reports/${reportId}`}
            title={`Report: ${reportId}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
              ${
                location === `/reports/${reportId}`
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="truncate max-w-[160px]">{reportId}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}