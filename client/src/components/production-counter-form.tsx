import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { GetNokCategory, GetProductionCounter, getProductionCounterSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Minus, Plus } from "lucide-react";

interface ProductionCounterFormProps {
  reportId: string;
  reportArea: string;
  initialData?: GetProductionCounter;
  onSuccess: () => void;
}

const formSchema = getProductionCounterSchema;

export default function ProductionCounterForm({ reportId, reportArea, initialData, onSuccess }: ProductionCounterFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { data: nokCategories = [] } = useQuery<GetNokCategory[]>({
    queryKey: [`/api/nok-categories/${reportArea}`],
    queryFn: () => api.getNokCategories(reportArea),
    enabled: !!reportArea,
  });

  const getNokDescription = (coding: string) => {
    const category = nokCategories.find(c => c.coding === coding);
    return category ? category.descriptionEn : null;
  };

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => api.createProductionCounter(reportId, data as GetProductionCounter),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to create counter", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => api.updateProductionCounter(reportId, initialData!.hour, data as GetProductionCounter),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to update counter", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, max?: number) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      field.onChange(0);
      return;
    }
    if (value < 0) {
      value = 0;
    }
    if (max !== undefined && value > max) {
      value = max;
    }
    field.onChange(value);
  };

  const nokFields = Object.keys(getProductionCounterSchema.shape).filter(key => key.startsWith('nok') && key !== 'nokCount' && key !== 'nokTaken');

  const renderNumericInput = (field: any, max?: number) => (
    <FormControl>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-20"
          onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
          disabled={field.value <= 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          placeholder="0"
          type="number"
          min="0"
          max={max}
          {...field}
          onChange={e => handleNumberChange(e, field, max)}
          className="text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-20"
          onClick={() => {
            const newValue = (field.value || 0) + 1;
            if (max === undefined || newValue <= max) {
              field.onChange(newValue);
            }
          }}
          disabled={max !== undefined && field.value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </FormControl>
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ScrollArea className="h-[60vh] p-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <FormField
          control={form.control}
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hour</FormLabel>
              {renderNumericInput(field)}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PN</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Part Number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="okCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OK Count</FormLabel>
              {renderNumericInput(field)}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nokCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NOK Count</FormLabel>
              {renderNumericInput(field)}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operators"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operators</FormLabel>
              {renderNumericInput(field)}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="operatorsIndirect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operators Indirect</FormLabel>
              {renderNumericInput(field)}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productionTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Production Time</FormLabel>
              {renderNumericInput(field, 60)}
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <hr className="my-6" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {nokFields.map(field => {
          const description = getNokDescription((field.slice(0,3) + '_' + field.slice(3)).toUpperCase());
          if (!description) return null;

          return (
            <FormField
              key={field}
              control={form.control}
              name={field as any}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{description}</FormLabel>
                  {renderNumericInput(formField)}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        </div>
        </ScrollArea>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {initialData ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
