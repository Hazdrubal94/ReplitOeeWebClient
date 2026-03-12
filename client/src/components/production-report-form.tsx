import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductionReportSchema, type CreateProductionReport } from "@shared/schema";
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
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

function toDatetime(val: string | undefined): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    return format(d, "yyyy-MM-dd");
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
  onSubmit: (data: CreateProductionReport) => void;
  isPending: boolean;
  submitLabel?: string;
}

export function ProductionReportForm({
  onSubmit,
  isPending,
  submitLabel = "Save",
}: ProductionReportFormProps) {
  const form = useForm<CreateProductionReport>({
    resolver: zodResolver(createProductionReportSchema),    
    defaultValues: {
      date: "",
      area: "",
      shift: 0,
      userName: "",
      userId: "",
      openDate: new Date().toISOString()
    }
  });

  const handleSubmit = (data: CreateProductionReport) => {
    const payload: CreateProductionReport = { ...data };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="AAA" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                    <Input type="text" placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>UserId</FormLabel>
                      <FormControl>
                          <Input type="text" placeholder="jxd3nn" {...field} />
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
