import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, CheckCircle2, XCircle, Users, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductionReport } from "@shared/schema";
import { format } from "date-fns";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
  accent?: "blue" | "green" | "red" | "purple";
}) {
  const accentColors = {
    blue: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
    green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950",
    red: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950",
  };
  const colors = accent ? accentColors[accent] : accentColors.blue;

  return (
    <Card className="border border-card-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-md ${colors}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: reports, isLoading, isError } = useQuery<ProductionReport[]>({
    queryKey: ["/api/proxy/reports"],
    queryFn: () => api.getProductionReports(),
    retry: false,
  });

  const totalReports = reports?.length ?? 0;
  const openReports = reports?.filter((r) => r.OpenReport).length ?? 0;
  const closedReports = reports?.filter((r) => !r.OpenReport).length ?? 0;
  const uniqueUsers = new Set(reports?.map((r) => r.UserId)).size;

  const recentReports = reports?.slice(0, 5) ?? [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Overview of production reports</p>
      </div>

      {isError && (
        <Card className="border border-card-border bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Unable to connect to API</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Make sure the REST API at <code className="font-mono text-xs bg-muted px-1 rounded">https://localhost:8443</code> is running and accessible.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={totalReports} icon={FileText} loading={isLoading} accent="blue" description="All production reports" />
        <StatCard title="Open Reports" value={openReports} icon={CheckCircle2} loading={isLoading} accent="green" description="Currently open" />
        <StatCard title="Closed Reports" value={closedReports} icon={XCircle} loading={isLoading} accent="red" description="Completed reports" />
        <StatCard title="Unique Users" value={uniqueUsers} icon={Users} loading={isLoading} accent="purple" description="Distinct report authors" />
      </div>

      <Card className="border border-card-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reports found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentReports.map((report) => (
                <div
                  key={report.IdReport}
                  data-testid={`row-report-${report.IdReport}`}
                  className="flex items-center justify-between px-6 py-3 gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{report.IdReport}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.UserName} &middot; {report.Area} &middot;{" "}
                      {report.Date ? format(new Date(report.Date), "MMM d, yyyy") : "—"}
                    </p>
                  </div>
                  <Badge variant={report.OpenReport ? "default" : "secondary"} data-testid={`status-report-${report.IdReport}`}>
                    {report.OpenReport ? "Open" : "Closed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
