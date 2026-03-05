import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductionReportSchema, type InsertProductionReport, type ProductionReport } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

function toDatetimeLocal(val: string | undefined): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return val;
  }
}

function fromDatetimeLocal(val: string): string {
  if (!val) return "";
  try {
    return new Date(val).toISOString();
  } catch {
    return val;
  }
}

interface ProductionReportFormProps {
  defaultValues?: Partial<ProductionReport>;
  onSubmit: (data: InsertProductionReport) => void;
  isPending: boolean;
  submitLabel?: string;
}

export function ProductionReportForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: ProductionReportFormProps) {
  const form = useForm<InsertProductionReport>({
    resolver: zodResolver(insertProductionReportSchema),
    defaultValues: {
      IdReport: defaultValues?.IdReport ?? "",
      Date: defaultValues?.Date ? toDatetimeLocal(defaultValues.Date) : "",
      UserId: defaultValues?.UserId ?? "",
      UserName: defaultValues?.UserName ?? "",
      Area: defaultValues?.Area ?? "",
      OpenReport: defaultValues?.OpenReport ?? false,
      OpenDate: defaultValues?.OpenDate ? toDatetimeLocal(defaultValues.OpenDate) : "",
      CloseDate: defaultValues?.CloseDate ? toDatetimeLocal(defaultValues.CloseDate) : "",
      AppVer: defaultValues?.AppVer ?? "",
      App: defaultValues?.App ?? 0,
      ShiftPatternVersion: defaultValues?.ShiftPatternVersion ?? 0,
    },
  });

  const handleSubmit = (data: InsertProductionReport) => {
    const payload: InsertProductionReport = {
      ...data,
      Date: fromDatetimeLocal(data.Date),
      OpenDate: fromDatetimeLocal(data.OpenDate),
      CloseDate: fromDatetimeLocal(data.CloseDate),
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="IdReport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report ID</FormLabel>
                <FormControl>
                  <Input placeholder="RPT-001" data-testid="input-id-report" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" data-testid="input-date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="UserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input placeholder="user-001" data-testid="input-user-id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="UserName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" data-testid="input-user-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="Area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <FormControl>
                <Input placeholder="Production Line A" data-testid="input-area" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="OpenDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" data-testid="input-open-date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="CloseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Close Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" data-testid="input-close-date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="OpenReport"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-border p-3 gap-3">
              <div>
                <FormLabel className="text-sm font-medium cursor-pointer">Open Report</FormLabel>
                <p className="text-xs text-muted-foreground">Whether this report is currently open</p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-open-report"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="AppVer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App Version</FormLabel>
                <FormControl>
                  <Input placeholder="1.0.0" data-testid="input-app-ver" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="App"
            render={({ field }) => (
              <FormItem>
                <FormLabel>App (byte)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    placeholder="0"
                    data-testid="input-app"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ShiftPatternVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift Pattern Version</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    data-testid="input-shift-pattern-version"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending} data-testid="button-submit-form">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
