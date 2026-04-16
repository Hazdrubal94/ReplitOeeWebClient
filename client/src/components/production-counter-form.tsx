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
import { GetNokCategory, GetCounterRowProductionTime, CreateUpdateProductionTimeAndCounterRows, createUpdateProductionTimeAndCounterRowsSchema, createUpdateProductionCounterSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ProductionCounterFormProps {
  reportId: string;
  reportArea: string;
  initialData?: GetCounterRowProductionTime;
  onSuccess: () => void;
}

export default function ProductionCounterForm({ reportId, reportArea, initialData, onSuccess }: ProductionCounterFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateUpdateProductionTimeAndCounterRows>({
    resolver: zodResolver(createUpdateProductionTimeAndCounterRowsSchema),
    defaultValues: {
      hour: initialData?.hour ?? 1,
      sequence: initialData?.sequence ?? 1,
      pn: initialData?.pn ?? "",
      fert: initialData?.fert ?? "",
      productionTime: initialData?.productionTime ?? 0,
      codings: initialData?.codings
    },
  });

  const { data: nokCategories = [] } = useQuery<GetNokCategory[]>({
    queryKey: [`/api/nok-categories/${reportArea}`],
    queryFn: () => api.getNokCategories(reportArea),
    enabled: !!reportArea,
  });

  const { data: pns = [], isLoading: isLoadingPns } = useQuery<string[]>({ 
    queryKey: [`/api/ProductionReports/PNs?area=${reportArea}`],
    queryFn: () => api.getPNs(reportArea),
    enabled: !!reportArea,
  });

  const getNokDescription = (coding: string) => {
    const category = nokCategories.find(c => c.coding === coding);
    return category ? category.descriptionEn : null;
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionTimeAndCounterRows) => api.createProductionTimeAndCounterRows(reportId, data),
    onSuccess: () => {
      onSuccess();
      toast({ title: "Production Counter Created", description: "The production counter has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create counter", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionTimeAndCounterRows) => api.updateProductionTimeAndCounterRows(reportId, initialData!.id, data),
    onSuccess: () => {
      onSuccess();
      toast({ title: "Production Counter Updated", description: "The production counter has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update counter", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: CreateUpdateProductionTimeAndCounterRows) => {
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

  const nokCodings = Object.keys(createUpdateProductionCounterSchema.shape).filter(key => key.startsWith('nok') && key !== 'nokCount' && key !== 'nokTaken')
                                                                            .map(key => (key.slice(0,3) + '_' + key.slice(3)).toUpperCase());

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
                  <Select required={ true } onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPns}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPns ? "Loading..." : "Select a PN"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pns.map((pn, index) => (
                    <SelectItem key={index} value={pn}>
                      {pn}
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
          name="fert"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FERT</FormLabel>
                  <Select required={true} onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPns}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingPns ? "Loading..." : "Select FERT"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pns.map((pn, index) => (
                    <SelectItem key={index} value={pn}>
                      {pn}
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
          name="codings.0.count"
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
        {nokCodings.map(codingName => {
          const description = getNokDescription(codingName);
          if (!description) return null;
          return (
            <FormField
              key={codingName}
              control={form.control}
              name={codingName as any}
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
