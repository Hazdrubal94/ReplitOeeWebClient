import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCurrentReport } from "@/lib/current-report-context";
import { useToast } from "@/hooks/use-toast";
import type { GetProductionReport, GetCounterRowProductionTime, GetProductionEvent, GetCategoryDescription, GetSubcategoryDescription, GetMachineDescription, GetNokCategory } from "@shared/schema";
import { z } from "zod";
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
  TableFooter
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ChevronDown, ChevronUp, Pen, Plus, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductionCounterForm from "@/components/production-counter-form";
import ProductionEventForm from "@/components/production-event-form";
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
import ReportHeaderContent from "@/components/report-header-content";

interface CurrentReportProps {
  params: { reportId: string };
}

const calculateDuration = (startTime: string, stopTime: string) => {
  if (!startTime || !stopTime) return 0;
  const [startHours, startMinutes] = startTime.slice(0, 5).split(':').map(Number);
  const [stopHours, stopMinutes] = stopTime.slice(0, 5).split(':').map(Number);
  const totalStartMinutes = startHours * 60 + startMinutes;
  const totalStopMinutes = stopHours * 60 + stopMinutes;
  let duration = totalStopMinutes - totalStartMinutes;
  if (duration < 0) {
    duration += 1440; // 24 * 60, handles overnight
  }
  return duration;
};

export default function CurrentReport({ params }: CurrentReportProps) {
  const [, navigate] = useLocation();
  const { setReportId } = useCurrentReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedCounterRows, setExpandedCounterRows] = useState<Set<number>>(new Set());
  const [expandedEventRows, setExpandedEventRows] = useState<Set<number>>(new Set());
  const [isCounterFormOpen, setIsCounterFormOpen] = useState(false);
  const [selectedCounterRow, setSelectedCounterRow] = useState<GetCounterRowProductionTime | undefined>(undefined);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GetProductionEvent | undefined>(undefined);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<GetProductionEvent | null>(null);
  const [counterToDelete, setCounterToDelete] = useState<GetCounterRowProductionTime | null>(null);
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

  const { data: counterRowProductionTimes = [], isLoading: counterRowsLoading } = useQuery<GetCounterRowProductionTime[]>({
    queryKey: [`/api/reports/${reportId}/ProductionTimes`],
    queryFn: () => api.getProductionTimeAndCounterRows(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<GetProductionEvent[]>({
    queryKey: [`/api/reports/${reportId}/Events`],
    queryFn: () => api.getProductionEvents(reportId!),
    enabled: !!reportId,
    retry: false,
  });

  const { data: categoryDescriptions = [] } = useQuery<GetCategoryDescription[]>({
    queryKey: ["/api/category-descriptions"],
    queryFn: () => api.getCategoryDescriptions(),
    enabled: !!reportId,
  });

  const { data: subcategoryDescriptions = [] } = useQuery<GetSubcategoryDescription[]>({
    queryKey: ["/api/subcategory-descriptions"],
    queryFn: () => api.getSubcategories(),
    enabled: !!reportId,
  });

  const { data: machineDescriptions = [] } = useQuery<GetMachineDescription[]>({
    queryKey: [`/api/machine-descriptions/${report?.area}`],
    queryFn: () => api.getMachineDescriptions(report!.area),
    enabled: !!report,
  });

  const { data: nokCategories = [] } = useQuery<GetNokCategory[]>({
    queryKey: [`/api/nok-categories/${report?.area}`],
    queryFn: () => api.getNokCategories(report!.area),
    enabled: !!report,
  });

  const deleteCounterRowMutation = useMutation({
    mutationFn: (counterId: number) => api.deleteProductionTimeAndCounterRows(counterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Counters`] });
      toast({ title: "Counter deleted" });
      setIsDeleteAlertOpen(false);
      setCounterToDelete(null);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete counter", description: err.message, variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: number) => api.deleteProductionEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Events`] });
      toast({ title: "Event deleted" });
      setIsDeleteAlertOpen(false);
      setEventToDelete(null);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete event", description: err.message, variant: "destructive" });
    },
  });

  const isLoading = reportLoading || counterRowsLoading || eventsLoading;
  const isError = reportError;

  const getCategoryDesc = (id: number) => {
    const category = categoryDescriptions.find(c => c.id === id);
    return category ? category.description : null;
  }

  const getSubcategoryDesc = (id: number | null) => {
    const subcategory = subcategoryDescriptions.find(s => s.id === id);
    return subcategory ? subcategory.descriptionEn : null;
  }

  const getMachineDesc = (id: number) => {
    const machine = machineDescriptions.find(m => m.id === id);
    return machine ? `${machine.machine} - ${machine.description}` : null;
  }

  const getNokDesc = (coding: string) => {
    const category = nokCategories.find(c => c.coding === coding);
    return category ? category.descriptionEn : null;
  }

  const toggleCounterRowExpanded = (idx: number) => {
    const newExpanded = new Set(expandedCounterRows);
    if (newExpanded.has(idx)) newExpanded.delete(idx);
    else newExpanded.add(idx);
    setExpandedCounterRows(newExpanded);
  };

  const toggleEventRowExpanded = (idx: number) => {
    const newExpanded = new Set(expandedEventRows);
    if (newExpanded.has(idx)) newExpanded.delete(idx);
    else newExpanded.add(idx);
    setExpandedEventRows(newExpanded);
  };

  const handleAddCounter = () => { setSelectedCounterRow(undefined); setIsCounterFormOpen(true); };
  const handleEditCounter = (counterRow: GetCounterRowProductionTime) => { setSelectedCounterRow(counterRow); setIsCounterFormOpen(true); };
  const handleDeleteCounter = (counterRow: GetCounterRowProductionTime) => { setCounterToDelete(counterRow); setIsDeleteAlertOpen(true); };
  const handleCounterFormClose = () => { setIsCounterFormOpen(false); setSelectedCounterRow(undefined); };

  const handleAddEvent = () => { setSelectedEvent(undefined); setIsEventFormOpen(true); };
  const handleEditEvent = (event: GetProductionEvent) => { setSelectedEvent(event); setIsEventFormOpen(true); };
  const handleDeleteEvent = (event: GetProductionEvent) => { setEventToDelete(event); setIsDeleteAlertOpen(true); };
  const handleEventFormClose = () => { setIsEventFormOpen(false); setSelectedEvent(undefined); };

  const confirmDelete = () => {
    if (eventToDelete) deleteEventMutation.mutate(eventToDelete.id);
    else if (counterToDelete) deleteCounterRowMutation.mutate(counterToDelete.id);
  };

  const totalOkCount = counterRowProductionTimes.reduce((acc, counterRow) => acc + counterRow.codings.find(c => c.name === 'OK')!.count, 0);
  const totalNokCount = counterRowProductionTimes.reduce((acc, counterRow) => acc + counterRow.codings.filter(c => c.name != 'OK').reduce((subAcc, coding) => subAcc + coding.count, 0), 0);
  const distinctPnsCount = [...new Set(counterRowProductionTimes.map(c => c.pn))].length;
  const averageOperators = counterRowProductionTimes.length > 0 ? (counterRowProductionTimes.reduce((acc, counterRow) => acc + counterRow.operators, 0) / counterRowProductionTimes.length) : 0;
  const averageOperatorsIndirect = counterRowProductionTimes.length > 0 ? (counterRowProductionTimes.reduce((acc, counterRow) => acc + counterRow.operatorsIndirect, 0) / counterRowProductionTimes.length) : 0;
  const sumProductionTime = counterRowProductionTimes.reduce((acc, counter) => acc + counter.productionTime, 0);

  const totalEventsDuration = events.reduce((acc, event) => acc + calculateDuration(event.startTime, event.stopTime), 0);
  const changeoversNumber = events.filter(event => event.category === 16).length;
  const availabilityLossNumber = events.filter(event => event.isAvailabilityLoss === true).length;
  const performanceLossNumber = events.filter(event => event.isAvailabilityLoss === false).length;

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex-shrink-0 border-b bg-background/95 sticky top-0 z-10">
        <ReportHeaderContent
          className="px-4 w-full"
          report={report}
          isLoading={reportLoading}
          onCloseReport={() => closeMutation.mutate()}
          isCompleting={closeMutation.isPending}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 min-h-0">
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {isError && (
            <Card className="border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Failed to load report</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Check your connection and try again.</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* PRODUCTION COUNTERS */}
            <Card className="border shadow-sm flex flex-col min-h-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Counters</CardTitle>
                <Button onClick={handleAddCounter} size="sm"><Plus className="w-4 h-4 mr-2"/>Add</Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="border border-b-0 rounded-md rounded-b-none flex-1 min-h-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-10"></TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Hour</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">PN</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">FERT</TableHead>
                          <TableHead className="px-3 text-center border-l border-dashed">OK</TableHead>
                          <TableHead className="px-3 text-center border-l border-dashed">NOK</TableHead>
                          <TableHead className="px-1 text-center border-l border-dashed">Operators</TableHead>
                          <TableHead className="px-1 text-center border-l border-dashed">Operators Ind</TableHead>
                          <TableHead className="px-1 text-center border-l border-dashed">Prod Time</TableHead>
                          <TableHead className="px-1 text-center border-l border-dashed">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="border-b">
                        {counterRowProductionTimes.map((counterRowProductionTime, idx) => {
                          const activeNokCodingsForRow = counterRowProductionTime.codings.filter(c => c.name != 'OK');
                          return (
                            <>
                              <TableRow key={`${idx}-main`} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleCounterRowExpanded(idx)}>
                                <TableCell className="w-10 bg-background text-center">
                                  {expandedCounterRows.has(idx) ? (
                                    <ChevronUp className="w-4 h-4 inline" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 inline" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-bold border-l border-dashed">{counterRowProductionTime.hour}</TableCell>
                                <TableCell className="text-center font-bold border-l border-dashed">{counterRowProductionTime.pn}</TableCell>
                                <TableCell className="text-center font-bold border-l border-dashed">{counterRowProductionTime.fert}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{counterRowProductionTime.codings.filter(c => c.name == 'OK').reduce((acc, coding) => acc + coding.count, 0)}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{counterRowProductionTime.codings.filter(c => c.name != 'OK').reduce((acc, coding) => acc + coding.count, 0)}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{counterRowProductionTime.operators}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{counterRowProductionTime.operatorsIndirect}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{counterRowProductionTime.productionTime}</TableCell>
                                <TableCell className="text-center border-l border-dashed">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditCounter(counterRowProductionTime); }}>
                                    <Pen className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteCounter(counterRowProductionTime); }} disabled={reportLoading}>
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {expandedCounterRows.has(idx) && (
                                <TableRow key={`${idx}-details`} className="bg-muted/20">
                                  <TableCell colSpan={10} className="p-0">
                                    {activeNokCodingsForRow.length === 0 ? (
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
                                          {activeNokCodingsForRow.map((nokCoding) => {
                                            const description = getNokDesc(nokCoding.name);
                                            if (!description) return null;
                                            return (
                                              <tr key={nokCoding.name} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                                                <td className="px-6 py-2 font-medium">{description}</td>
                                                <td className="px-6 py-2 text-right font-bold">{nokCoding.count}</td>
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
                  <div className="border border-t-0 rounded-md rounded-t-none">
                    <Table>
                      <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} rowSpan={2} className="font-bold text-lg text-center align-middle">Summary:</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Distinct PNs</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Total OK</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Total NOK</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Avg Oper. Number</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Avg Ind. Oper. Number</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Total Prod. Time</TableCell>
                            <TableCell/>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-bold text-center">{distinctPnsCount}</TableCell>
                            <TableCell className="font-bold text-center">{totalOkCount}</TableCell>
                            <TableCell className="font-bold text-center">{totalNokCount}</TableCell>
                            <TableCell className="font-bold text-center">{averageOperators}</TableCell>
                            <TableCell className="font-bold text-center">{averageOperatorsIndirect}</TableCell>
                            <TableCell className="font-bold text-center">{sumProductionTime}</TableCell>
                            <TableCell/>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
              </CardContent>
            </Card>

            {/* PRODUCTION EVENTS */}
            <Card className="border shadow-sm flex flex-col min-h-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Events</CardTitle>
                <Button onClick={handleAddEvent} size="sm" disabled={reportLoading}><Plus className="w-4 h-4 mr-2"/>Add</Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="border border-b-0 rounded-md rounded-b-none flex-1 min-h-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-10"></TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Start</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Stop</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Duration</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">PN</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Category</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Type</TableHead>
                          <TableHead className="px-2 text-center border-l border-dashed">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event, idx) => {
                          const hasMachine = !!event.machineNr;
                          const hasSubcategory = !!event.subcategory;
                          const hasDescription = !!event.description?.trim();
                          const duration = calculateDuration(event.startTime, event.stopTime);

                          return (
                            <>
                              <TableRow
                                key={`event-${idx}-main`}
                                className={"cursor-pointer hover:bg-muted/50"}
                                onClick={hasDescription || hasSubcategory ? () => toggleEventRowExpanded(idx) : undefined}
                                aria-disabled={!hasDescription && !hasSubcategory}
                                title={hasDescription || hasSubcategory ? "Show details" : "No details available"}
                              >
                                <TableCell className="w-10 bg-background text-center">
                                  {hasDescription || hasSubcategory ? (
                                    expandedEventRows.has(idx) ? (
                                      <ChevronUp className="w-4 h-4 inline" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 inline" />
                                    )
                                  ) : null}
                                </TableCell>
                                <TableCell className="text-center border-l border-dashed">{event.startTime.slice(0,5)}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{event.stopTime.slice(0,5)}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{duration}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{event.pn}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{getCategoryDesc(event.category) ?? "—"}</TableCell>
                                <TableCell className="text-center border-l border-dashed">{event.isAvailabilityLoss ? "Av" : "Pf"}</TableCell>
                                <TableCell  className="text-center border-l border-dashed">
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} disabled={reportLoading}>
                                    <Pen className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event); }} disabled={reportLoading}>
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {(hasMachine || hasDescription || hasSubcategory) && expandedEventRows.has(idx) && (
                                <TableRow key={`event-${idx}-details`} className="bg-muted/20 hover:bg-muted/30">
                                  <TableCell colSpan={8} className="px-6 py-4 bg-muted/20">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                          Machine
                                        </p>
                                        <p className="text-sm text-foreground">{getMachineDesc(event.machineNr) ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                          Subcategory
                                        </p>
                                        <p className="text-sm text-foreground">{getSubcategoryDesc(event.subcategory) ?? "—"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                          Description
                                        </p>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{event.description?.trim() || "—"}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <div className="border border-t-0 rounded-md rounded-t-none">
                    <Table>
                      <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} rowSpan={2} className="font-bold text-lg text-center align-middle">Summary:</TableCell>
                            <TableCell colSpan={2} className="text-center text-xs font-medium text-muted-foreground">Total Duration</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Changeovers Number</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Availability Loss Number</TableCell>
                            <TableCell className="text-center text-xs font-medium text-muted-foreground">Performance Loss Number</TableCell>
                            <TableCell/>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2} className="font-bold text-center">{totalEventsDuration}</TableCell>
                            <TableCell className="font-bold text-center">{changeoversNumber}</TableCell>
                            <TableCell className="font-bold text-center">{availabilityLossNumber}</TableCell>
                            <TableCell className="font-bold text-center">{performanceLossNumber}</TableCell>
                            <TableCell/>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Dialog open={isCounterFormOpen} onOpenChange={handleCounterFormClose}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader><DialogTitle>{selectedCounterRow ? 'Edit Counter' : 'Add Counter'}</DialogTitle></DialogHeader>
          {report && (
            <ProductionCounterForm
              reportId={reportId!}
              initialData={selectedCounterRow}
              reportArea={report.area}
              onSuccess={() => { handleCounterFormClose(); queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Counters`] }); }}
            />
          )}
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
                userName={report.userName}
                reportArea={report.area}
                initialData={selectedEvent}
                categoryDescriptions={categoryDescriptions}
                machineDescriptions={machineDescriptions}
                onSuccess={() => {
                  handleEventFormClose();
                  queryClient.invalidateQueries({ queryKey: [`/api/reports/${reportId}/Events`] });
                }}
              />
            )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this element?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteEventMutation.isPending || deleteCounterRowMutation.isPending}>
              {deleteEventMutation.isPending || deleteCounterRowMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}