import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import type { ProductionReport, InsertProductionReport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductionReportForm } from "@/components/production-report-form";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

type SortKey = keyof ProductionReport;
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground/50" />;
  if (sortDir === "asc") return <ChevronUp className="w-3.5 h-3.5 ml-1 text-primary" />;
  return <ChevronDown className="w-3.5 h-3.5 ml-1 text-primary" />;
}

function formatDateCell(val: string) {
  if (!val) return <span className="text-muted-foreground">—</span>;
  try {
    return format(new Date(val), "MMM d, yyyy HH:mm");
  } catch {
    return val;
  }
}

export default function ProductionReports() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("Date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editReport, setEditReport] = useState<ProductionReport | null>(null);
  const [deleteReport, setDeleteReport] = useState<ProductionReport | null>(null);

  const { data: reports = [], isLoading, isError, refetch, isFetching } = useQuery<ProductionReport[]>({
    queryKey: ["/api/proxy/reports"],
    queryFn: () => api.getProductionReports(),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProductionReport) => api.createProductionReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/reports"] });
      setCreateOpen(false);
      toast({ title: "Report created", description: "Production report has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create report", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertProductionReport }) =>
      api.updateProductionReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/reports"] });
      setEditReport(null);
      toast({ title: "Report updated", description: "Production report has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update report", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProductionReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/reports"] });
      setDeleteReport(null);
      toast({ title: "Report deleted", description: "Production report has been removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete report", description: err.message, variant: "destructive" });
    },
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reports.filter((r) =>
      !q ||
      r.IdReport?.toLowerCase().includes(q) ||
      r.UserName?.toLowerCase().includes(q) ||
      r.UserId?.toLowerCase().includes(q) ||
      r.Area?.toLowerCase().includes(q) ||
      r.AppVer?.toLowerCase().includes(q)
    );
  }, [reports, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === "boolean") av = av ? 1 : 0;
      if (typeof bv === "boolean") bv = bv ? 1 : 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  const SortableHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center">
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </TableHead>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground">Production Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "Loading..." : `${sorted.length} of ${reports.length} report${reports.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-48 sm:w-64"
                data-testid="input-search"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setCreateOpen(true)} data-testid="button-create-report">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-7xl mx-auto h-full">
          {isError && (
            <Card className="mb-4 border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-destructive">Cannot connect to REST API</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ensure the API at <code className="font-mono bg-muted px-1 rounded">https://localhost:8443</code> is running.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()} data-testid="button-retry">
                Retry
              </Button>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-base font-medium text-muted-foreground">No reports found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {search ? "Try a different search term." : "Create your first production report."}
              </p>
              {!search && (
                <Button className="mt-4" onClick={() => setCreateOpen(true)} data-testid="button-create-first">
                  <Plus className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-full rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <SortableHeader col="IdReport" label="Report ID" />
                    <SortableHeader col="Date" label="Date" />
                    <SortableHeader col="UserName" label="User" />
                    <SortableHeader col="Area" label="Area" />
                    <SortableHeader col="OpenReport" label="Status" />
                    <SortableHeader col="AppVer" label="App Ver" />
                    <SortableHeader col="App" label="App" />
                    <SortableHeader col="ShiftPatternVersion" label="Shift Ver" />
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((report) => (
                    <TableRow
                      key={report.IdReport}
                      className="group"
                      data-testid={`row-report-${report.IdReport}`}
                    >
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {report.IdReport}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateCell(report.Date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-tight">{report.UserName}</p>
                          <p className="text-xs text-muted-foreground">{report.UserId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{report.Area}</TableCell>
                      <TableCell>
                        <Badge
                          variant={report.OpenReport ? "default" : "secondary"}
                          data-testid={`status-report-${report.IdReport}`}
                        >
                          {report.OpenReport ? "Open" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{report.AppVer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{report.App}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{report.ShiftPatternVersion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditReport(report)}
                            data-testid={`button-edit-${report.IdReport}`}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteReport(report)}
                            data-testid={`button-delete-${report.IdReport}`}
                            title="Delete"
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Production Report</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new production report.
            </DialogDescription>
          </DialogHeader>
          <ProductionReportForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            submitLabel="Create Report"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editReport} onOpenChange={(open) => !open && setEditReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Production Report</DialogTitle>
            <DialogDescription>
              Modify the fields and save your changes.
            </DialogDescription>
          </DialogHeader>
          {editReport && (
            <ProductionReportForm
              defaultValues={editReport}
              onSubmit={(data) => updateMutation.mutate({ id: editReport.IdReport, data })}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteReport} onOpenChange={(open) => !open && setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete report{" "}
              <span className="font-mono font-semibold">{deleteReport?.IdReport}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReport && deleteMutation.mutate(deleteReport.IdReport)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
