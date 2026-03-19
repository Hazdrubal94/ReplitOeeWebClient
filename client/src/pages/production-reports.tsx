import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import type { GetProductionReport, CreateProductionReport } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FolderOpen,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

type SortKey = keyof GetProductionReport;
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [pageNumber, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: reports = [], isLoading, isError, refetch, isFetching } = useQuery<GetProductionReport[]>({
    queryKey: ["/api/proxy/reports", pageNumber, pageSize],
    queryFn: () => api.getProductionReportsByPage(pageNumber, pageSize),
    retry: false
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductionReport) => api.createProductionReport(data),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/reports"] });
      setCreateOpen(false);
      toast({ title: "Report created", description: "Production report has been created successfully." });
      navigate(`/reports/${newReport.idReport}`);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create report", description: err.message, variant: "destructive" });
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
      r.idReport?.toLowerCase().includes(q) ||
      r.userName?.toLowerCase().includes(q) ||
      r.userId?.toLowerCase().includes(q) ||
      r.area?.toLowerCase().includes(q)
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

  const hasNextPage = reports.length === pageSize;
  const hasPrevPage = pageNumber > 1;

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setPage(1);
  };

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
        <div className="flex flex-wrap items-center justify-between gap-3 mx-auto">
          <div>
            <h1 className="text-xl font-bold text-foreground">Production Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading..."
                : `Page ${pageNumber} · ${sorted.length} record${sorted.length !== 1 ? "s" : ""}`}
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
        <div className="mx-auto h-full flex flex-col gap-3">
          {isError && (
            <Card className="mb-4 border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3 flex-shrink-0">
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
            <>
              <ScrollArea className="h-full rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <SortableHeader col="idReport" label="Report ID" />
                      <SortableHeader col="date" label="Date" />
                      <SortableHeader col="area" label="Area" />
                      <SortableHeader col="shift" label="Shift" />
                      <SortableHeader col="userId" label="UserId" />
                      <SortableHeader col="userName" label="User Name" />
                      <SortableHeader col="openReport" label="Status" />
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((report) => (
                      <TableRow
                        key={report.idReport}
                        className="productionReportSchema"
                        data-testid={`row-report-${report.idReport}`}
                        >
                        <TableCell>{report.idReport}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.area}</TableCell>
                        <TableCell>{report.shift}</TableCell>
                        <TableCell>{report.userId}</TableCell>
                        <TableCell>{report.userName}</TableCell>
                        <TableCell>
                          <Badge
                              variant={report.openReport ? "default" : "secondary"}
                              data-testid={`status-report-${report.idReport}`}
                          >
                              {report.openReport ? "Opened" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => navigate(`/reports/${report.idReport}`)}
                              title="Open"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination bar */}
              <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows per page</span>
                  <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page {pageNumber}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!hasPrevPage || isFetching}
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNextPage || isFetching}
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>            
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
    </div>
  );
}
