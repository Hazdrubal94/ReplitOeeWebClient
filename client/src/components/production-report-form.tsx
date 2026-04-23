import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { GetAreaDescription, CreateProductionReport, createProductionReportSchema } from "@shared/schema";
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
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      shift: 1,
      userName: "",
      userId: "",
      openDate: new Date().toISOString()
    }
  });

  const { data: areaDescriptions = [], isLoading: isLoadingAreaDescriptions } = useQuery<GetAreaDescription[]>({ 
    queryKey: [`/api/ProductionReports/Areas`],
    queryFn: () => api.getAreaDescriptions()
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
                <Input required type="date" {...field} />
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
                <Select required onValueChange={field.onChange} disabled={isLoadingAreaDescriptions}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAreaDescriptions ? "Loading..." : "Select Area"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areaDescriptions.map(areaDescription => (
                    <SelectItem key={areaDescription.id} value={areaDescription.area}>
                      {areaDescription.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <div className="grid grid-cols-3 gap-6">
                  <Button className="w-full h-16" type="button" variant={field.value === 1 ? "default" : "outline"} onClick={() => form.setValue("shift", 1)}>1</Button>
                  <Button className="w-full h-16" type="button" variant={field.value === 2 ? "default" : "outline"} onClick={() => form.setValue("shift", 2)}>2</Button>
                  <Button className="w-full h-16" type="button" variant={field.value === 3 ? "default" : "outline"} onClick={() => form.setValue("shift", 3)}>3</Button>
                </div>
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
                  <Input required type="text" placeholder="John Doe" {...field} />
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
                  <Input required type="text" placeholder="jxd3nn" {...field} />
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
