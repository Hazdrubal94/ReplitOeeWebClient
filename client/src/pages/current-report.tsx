import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCurrentReport } from "@/lib/current-report-context";
import type { GetProductionReport, GetProductionCounter } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface CurrentReportProps {
  params: { reportId: string };
}

export default function CurrentReport({ params }: CurrentReportProps) {
  const [, navigate] = useLocation();
  const { setReportId } = useCurrentReport();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const reportId = params?.reportId;

  useEffect(() => {
    setReportId(reportId || null);
  }, [reportId, setReportId]);

  const { data: report, isLoading: reportLoading, isError: reportError } = useQuery<GetProductionReport>({
    queryKey: [`/api/reports/${reportId}`],
    queryFn: () => api.getProductionReport(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const { data: counters = [], isLoading: countersLoading, isError: countersError } = useQuery<GetProductionCounter[]>({
    queryKey: [`/api/reports/${reportId}/ProductionCounters`],
    queryFn: () => api.getProductionCounters(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const isLoading = reportLoading || countersLoading;
  const isError = reportError || countersError;

  const getNokColumns = () => {
    if (counters.length === 0) return [];
    const firstCounter = counters[0];
    const nokKeys = Object.keys(firstCounter)
      .filter(key => key.startsWith('nok') && key !== 'nokCount' && key != 'nokTaken');
    return nokKeys as (keyof GetProductionCounter)[];
  };

  const allNokColumns = getNokColumns();

  const activeNokColumns = allNokColumns.filter(col =>
    counters.some(counter => (counter[col] as number) > 0)
  );

  const toggleRowExpanded = (idx: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/reports")}
            title="Back to reports"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Production Report</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "Loading..." : `Report ID: ${report?.idReport}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {isError && (
            <Card className="border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Failed to load report</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Check your connection and try again.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Report Details */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent>
              {reportLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full rounded-md" />
                  ))}
                </div>
              ) : report ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Report ID</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{report.idReport}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {report.date ? format(new Date(report.date), "MMM d, yyyy HH:mm") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Area</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{report.area}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shift</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{report.shift}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{report.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User Name</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{report.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {report.openReport ? "Open" : "Closed"}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Production Counters Table */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle>Production Counters</CardTitle>
            </CardHeader>
            <CardContent>
              {countersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : counters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No production counters found for this report.</p>
                </div>
              ) : (
                <ScrollArea className="w-full rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-10 sticky left-0 bg-muted/40 z-10"></TableHead>
                        <TableHead className="sticky left-12 bg-muted/40 z-10">Hour</TableHead>
                        <TableHead className="sticky left-24 bg-muted/40 z-10">PN</TableHead>
                        <TableHead>OK Count</TableHead>
                        <TableHead>NOK Count</TableHead>
                        <TableHead>Operators</TableHead>
                        <TableHead>Operators Indirect</TableHead>
                        {activeNokColumns.length > 0 && (
                          <TableHead colSpan={activeNokColumns.length}>Used NOK Codes</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {counters.map((counter, idx) => (
                        <>
                          <TableRow key={`${idx}-main`} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpanded(idx)}>
                            <TableCell className="w-10 sticky left-0 bg-background z-10 text-center">
                              {expandedRows.has(idx) ? (
                                <ChevronUp className="w-4 h-4 inline" />
                              ) : (
                                <ChevronDown className="w-4 h-4 inline" />
                              )}
                            </TableCell>
                            <TableCell className="sticky left-12 bg-background z-10 font-medium">
                              {counter.hour}
                            </TableCell>
                            <TableCell className="sticky left-24 bg-background z-10">
                              {counter.pn}
                            </TableCell>
                            <TableCell>{counter.okCount}</TableCell>
                            <TableCell>{counter.nokCount}</TableCell>
                            <TableCell>{counter.operators}</TableCell>
                            <TableCell>{counter.operatorsIndirect}</TableCell>
                            {activeNokColumns.filter(col =>(counter[col] as number) > 0).map((col) => (
                              <TableCell key={col} className="text-xs text-center font-semibold">
                                {col.replace('nok', 'NOK_').toUpperCase()}
                              </TableCell>
                            ))}
                          </TableRow>
                          {expandedRows.has(idx) && (
                            <TableRow key={`${idx}-details`} className="bg-muted/20 hover:bg-muted/30">
                              <TableCell colSpan={7 + allNokColumns.length} className="p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                  {allNokColumns.length > 0 && (
                                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">NOK Categories</p>
                                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-13 gap-2">
                                        {allNokColumns.map((col) => {
                                          const nokLetter = col.replace('nok', '').toUpperCase();
                                          const nokValue = counter[col] as number;
                                          return (
                                            <div key={col} className="text-center p-2 bg-background rounded border border-border">
                                              <p className="text-xs font-medium text-muted-foreground">NOK_{nokLetter}</p>
                                              <p className="text-sm font-bold text-foreground mt-1">{nokValue}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
