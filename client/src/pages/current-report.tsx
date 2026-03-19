import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCurrentReport } from "@/lib/current-report-context";
import { useToast } from "@/hooks/use-toast";
import type { GetProductionReport, GetProductionCounter, GetProductionEvent } from "@shared/schema";
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
import { AlertCircle, ChevronDown, ChevronUp, Pen, Plus } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductionCounterForm from "@/components/production-counter-form";
import ProductionEventForm from "@/components/production-event-form";

interface CurrentReportProps {
  params: { reportId: string };
}

export default function CurrentReport({ params }: CurrentReportProps) {
  const [, navigate] = useLocation();
  const { setReportId } = useCurrentReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCounterRows, setExpandedCounterRows] = useState<Set<number>>(new Set());
  const [expandedEventRows, setExpandedEventRows] = useState<Set<number>>(new Set());
  const [isCounterFormOpen, setIsCounterFormOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<GetProductionCounter | undefined>(undefined);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GetProductionEvent | undefined>(undefined);
  const reportId = params?.reportId;

  useEffect(() => {
    setReportId(reportId || null);
  }, [reportId, setReportId]);

  const closeMutation = useMutation({
    mutationFn: () => api.closeProductionReport(reportId!),
    onSuccess: (updatedReport) => {
      queryClient.setQueryData([`/api/reports/${reportId}`], updatedReport);
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/reports"] });
      toast({ title: "Report completed" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to close report", description: err.message, variant: "destructive" });
    },
  });

  const { data: report, isLoading: reportLoading, isError: reportError } = useQuery<GetProductionReport>({
    queryKey: [`/api/reports/${reportId}`],
    queryFn: () => api.openProductionReport(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const { data: counters = [], isLoading: countersLoading } = useQuery<GetProductionCounter[]>({
    queryKey: [`/api/reports/${reportId}/Counters`],
    queryFn: () => api.getProductionCounters(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<GetProductionEvent[]>({
    queryKey: [`/api/reports/${reportId}/Events`],
    queryFn: () => api.getProductionEvents(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const isLoading = reportLoading || countersLoading || eventsLoading;
  const isError = reportError;

  const getNokColumns = () => {
    if (counters.length === 0) return [];
    const firstCounter = counters[0];
    const nokKeys = Object.keys(firstCounter)
      .filter(key => key.startsWith('nok') && key !== 'nokCount' && key != 'nokTaken');
    return nokKeys as (keyof GetProductionCounter)[];
  };

  const allNokColumns = getNokColumns();

  const toggleCounterRowExpanded = (idx: number) => {
    const newExpanded = new Set(expandedCounterRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedCounterRows(newExpanded);
  };

  const toggleEventRowExpanded = (idx: number) => {
    const newExpanded = new Set(expandedEventRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedEventRows(newExpanded);
  };

  const handleAddCounter = () => {
    setSelectedCounter(undefined);
    setIsCounterFormOpen(true);
  };

  const handleEditCounter = (counter: GetProductionCounter) => {
    setSelectedCounter(counter);
    setIsCounterFormOpen(true);
  };

  const handleCounterFormClose = () => {
    setIsCounterFormOpen(false);
    setSelectedCounter(undefined);
  }

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event: GetProductionEvent) => {
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  const handleEventFormClose = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(undefined);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-background/95 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 mx-auto">
          {/* Details */}
          <Card className="border border-border shadow-sm w-full">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
              {reportLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full rounded-md" />
                  ))}
                </div>
              ) : report ? (
                <CardContent>
                  <div className="grid grid-cols-8 gap-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Report ID</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{report.idReport}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {report.date ? format(new Date(report.date), "MMM d, yyyy") : "—"}
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
                        {report.openReport ? "Opened" : "Completed"}
                      </p>
                    </div>
                    <Button
                      onClick={() => closeMutation.mutate()}
                      disabled={closeMutation.isPending || !report.openReport}
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      {closeMutation.isPending ? "Completing..." : "Complete"}
                    </Button>
                  </div>
                </CardContent>
              ) : null}
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="mx-auto space-y-6">
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

          {/* Production Counters + Events side-by-side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Production Counters Table */}
            <Card className="border border-border shadow-sm min-w-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Production Counters</CardTitle>
                <Button onClick={handleAddCounter} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
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
                  <ScrollArea className=" h-[600px] w-full rounded-md border border-border">
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
                          <TableHead>Production Time</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {counters.map((counter, idx) => {
                          const activeNoksForRow = allNokColumns.filter(
                            col => (counter[col] as number) > 0
                          );
                          return (
                            <>
                              <TableRow key={`${idx}-main`} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleCounterRowExpanded(idx)}>
                                <TableCell className="w-10 sticky left-0 bg-background z-10 text-center">
                                  {expandedCounterRows.has(idx) ? (
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
                                <TableCell>{counter.productionTime}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditCounter(counter); }}>
                                    <Pen className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {expandedCounterRows.has(idx) && (
                                <TableRow key={`${idx}-details`} className="bg-muted/20">
                                  <TableCell colSpan={9} className="p-0">
                                    {activeNoksForRow.length === 0 ? (
                                      <p className="text-xs text-muted-foreground px-6 py-3">No NOK categories with values greater than 0.</p>
                                    ) : (
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-border bg-muted/30">
                                            <th className="text-left px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">NOK Category</th>
                                            <th className="text-right px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {activeNoksForRow.map((col) => {
                                            const label = `NOK_${(col as string).replace('nok', '').toUpperCase()}`;
                                            const value = counter[col] as number;
                                            return (
                                              <tr key={col as string} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                                                <td className="px-6 py-2 font-medium">{label}</td>
                                                <td className="px-6 py-2 text-right font-bold">{value}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Production Events Table */}
            <Card className="border border-border shadow-sm min-w-0">
              <CardHeader  className="flex flex-row items-center justify-between">
                <CardTitle>Production Events</CardTitle>
                <Button onClick={handleAddEvent} size="sm" disabled={reportLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No production events found for this report.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] w-full rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>Stop Time</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Machine</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event, idx) => {
                          const hasDescription = !!event.description?.trim();

                          return (
                            <>
                              <TableRow
                                key={`event-${idx}-main`}
                                className={"cursor-pointer hover:bg-muted/50"}
                                onClick={hasDescription ? () => toggleEventRowExpanded(idx) : undefined}
                                aria-disabled={!hasDescription}
                                title={hasDescription ? "Show description" : "No description available"}
                              >
                                <TableCell className="w-10 text-center">
                                  {hasDescription ? (
                                    expandedEventRows.has(idx) ? (
                                      <ChevronUp className="w-4 h-4 inline" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 inline" />
                                    )
                                  ) : null}
                                </TableCell>
                                <TableCell>{event.startTime.slice(0,5)}</TableCell>
                                <TableCell>{event.stopTime.slice(0,5)}</TableCell>
                                <TableCell>{event.category}</TableCell>
                                <TableCell>{event.machine}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} disabled={reportLoading}>
                                    <Pen className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {hasDescription && expandedEventRows.has(idx) && (
                                <TableRow key={`event-${idx}-details`} className="bg-muted/20 hover:bg-muted/30">
                                  <TableCell colSpan={6} className="px-6 py-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                      Description
                                    </p>
                                    <p className="text-sm text-foreground">{event.description ?? "—"}</p>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={isCounterFormOpen} onOpenChange={handleCounterFormClose}>
        <DialogContent className="sm:max-w-[80vw]">
            <DialogHeader>
                <DialogTitle>{selectedCounter ? 'Edit Counter' : 'Add Counter'}</DialogTitle>
            </DialogHeader>
            <ProductionCounterForm
                reportId={reportId!}
                initialData={selectedCounter}
                onSuccess={() => {
                    handleCounterFormClose();
                    queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Counters`] });
                }}
            />
        </DialogContent>
      </Dialog>
      <Dialog open={isEventFormOpen} onOpenChange={handleEventFormClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
            {report && (
              <ProductionEventForm
                reportId={reportId!}
                initialData={selectedEvent}
                userName={report.userName}
                onSuccess={() => {
                  handleEventFormClose();
                  queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Events`] });
                }}
              />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
