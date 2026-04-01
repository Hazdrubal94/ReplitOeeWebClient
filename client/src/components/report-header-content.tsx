// /components/ReportDetailsContent.tsx
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GetProductionReport } from "@shared/schema";

interface ReportDetailsContentProps {
  report?: GetProductionReport;
  isLoading?: boolean;
  onCloseReport?: () => void;
  isCompleting?: boolean;
  className?: string;
}

export default function ReportDetailsContent({
  report,
  isLoading,
  onCloseReport,
  isCompleting,
  className = "",
}: ReportDetailsContentProps) {
  if (isLoading) {
    return (
      <div className={`w-full p-4 bg-background rounded-lg shadow-sm ${className}`}>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className={`w-full py-1 bg-white ${className}`}>
      <div className="grid grid-cols-6 text-center items-start">
        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">Report ID: </span><span className="font-bold">{report.idReport}</span></p>
        </div>

        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">Date: </span>
          <span className="font-bold">
            {report.date ? format(new Date(report.date), "MMM d, yyyy") : "—"}
          </span>
          </p>
        </div>

        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">Area: </span><span className="font-bold">{report.area}</span></p>
        </div>

        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">Shift: </span><span className="font-bold">{report.shift}</span></p>
        </div>
       
        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">User: </span><span className="font-bold">{report.userName} ({report.userId})</span></p>
        </div>

        <div>
          <p className="uppercase text-xs tracking-wider"><span className="font-medium text-muted-foreground">Status: </span><span className="font-bold">{report.openReport ? "Opened" : "Completed"}</span></p>
        </div>

        {/* <div className="flex items-center">
          <Button onClick={onCloseReport} disabled={isCompleting || !report.openReport}>
            <PenLine className="w-4 h-4 mr-2" />
            {isCompleting ? "Completing..." : "Complete"}
          </Button>
        </div> */}
      </div>
    </div>
  );
}