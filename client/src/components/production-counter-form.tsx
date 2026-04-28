import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { GetNokCategory, GetCounterRowProductionTime, CreateUpdateProductionTimeAndCounterRows, createUpdateProductionTimeAndCounterRowsSchema, Coding } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import React from "react";
import { Skeleton } from "./ui/skeleton";

interface ProductionCounterFormProps {
  reportId: string;
  reportArea: string;
  initialData?: GetCounterRowProductionTime;
  onSuccess: () => void;
}

const codingNamesArray = ["OK", "NOK_A", "NOK_B", "NOK_C", "NOK_D", "NOK_E", "NOK_F", "NOK_G", "NOK_H", "NOK_I", "NOK_J", "NOK_K", "NOK_L", "NOK_M", "NOK_N", "NOK_O", "NOK_P", "NOK_Q", "NOK_R", "NOK_S", "NOK_T", "NOK_X", "NOK_Y", "NOK_Z",
    "NOK_Aa", "NOK_Bb", "NOK_Cc", "NOK_Dd", "NOK_Ee", "NOK_Ff", "NOK_Gg", "NOK_Hh", "NOK_Ii", "NOK_Jj", "NOK_Kk"];

const codingsDefaultValues = codingNamesArray.map(name => ({
    name,
    pn: "",
    errorCodes: [],
    summary: 0,
}));

export default function ProductionCounterForm({ reportId, reportArea, initialData, onSuccess }: ProductionCounterFormProps) {
  const { toast } = useToast();

  const form = useForm<CreateUpdateProductionTimeAndCounterRows>({
    resolver: zodResolver(createUpdateProductionTimeAndCounterRowsSchema),
    defaultValues: {
      hour: initialData?.hour ?? 1,
      pn: initialData?.pn ?? undefined,
      fert: initialData?.fert ?? undefined,
      productionTime: initialData?.productionTime ?? 0,
      operators: initialData?.operators ?? 0,
      operatorsIndirect: initialData?.operatorsIndirect ?? 0,
      codings: initialData?.codings ?? codingsDefaultValues,
    },
  });

  const hour = form.watch("hour");
  const pn = form.watch("pn");
  const { setValue } = form;

  const { data: fetchedCodings, isLoading, isError } = useQuery<Coding[]>({ 
    queryKey: ['codings', reportId, hour, pn],
    queryFn: () => api.getCodings(reportId, hour, pn as string),
    enabled: !!reportId && !!hour && !!pn && !initialData,
  })

  React.useEffect(() => {
    if (isError) {
      toast({ title: "Failed to fetch codings", description: "Could not load coding data. Values have been reset.", variant: "destructive" });
      if (pn) {
        const updatedCodings = codingsDefaultValues.map(defaultCoding => ({
          ...defaultCoding,
          pn: pn,
          summary: 0,
          errorCodes: [],
        }));
        setValue('codings', updatedCodings);
      }
    }
  }, [isError, pn, setValue, toast]);

  React.useEffect(() => {
    if (!pn) return;
    
    if (fetchedCodings) {
        const updatedCodings = codingsDefaultValues.map(defaultCoding => {
            const fetched = fetchedCodings.find(c => c.name === defaultCoding.name);
            return {
                ...defaultCoding,
                pn: pn,
                summary: fetched?.summary ?? 0,
                errorCodes: fetched?.errorCodes ?? [],
            };
        });
        setValue('codings', updatedCodings);
    }
  }, [fetchedCodings, pn, setValue]);

  const codings = form.watch("codings");
  const okCodingIndex = codings.findIndex(c => c.name === "OK");

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, min?: number, max?: number) => {
    let value = parseInt(e.target.value, 10);
    const minValue = min ?? 0;
    if (isNaN(value)) {
      field.onChange(minValue);
      return;
    }
    if (value < minValue) {
      value = minValue;
    }
    if (max !== undefined && value > max) {
      value = max;
    }
    field.onChange(value);
  };

  const renderNumericInput = (field: any, isRequired: boolean, min?: number, max?: number, disabled: boolean = false) => (
    <FormControl>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-20"
          onClick={() => field.onChange(Math.max(min ?? 0, (field.value || 0) - 1))}
          disabled={disabled || field.value <= (min ?? 0)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          required={isRequired}
          placeholder="0"
          type="number"
          min={min}
          max={max}
          {...field}
          onChange={e => handleNumberChange(e, field, min, max)}
          disabled={disabled}
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
          disabled={disabled || (max !== undefined && field.value >= max)}
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
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <FormField
          control={form.control}
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hour</FormLabel>
              {renderNumericInput(field, true, 1, 8, !!initialData)}
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
                  <Select required onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPns || !!initialData}>
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
                  <Select required onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPns}>
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
        {okCodingIndex > -1 && (
            isLoading && !initialData ? (
                <FormItem>
                    <FormLabel>OK Count</FormLabel>
                    <Skeleton className="h-10" />
                </FormItem>
            ) : (
                <FormField
                    control={form.control}
                    name={`codings.${okCodingIndex}.summary`}
                    render={({ field }) => {
                        const min = codings[okCodingIndex].errorCodes.filter(ec => ec.code !== -9999).reduce((sum, ec) => sum + (ec.count || 0), 0);
                        return (
                        <FormItem>
                            <FormLabel>OK Count</FormLabel>
                            {renderNumericInput(field, true, min)}
                            <FormMessage />
                        </FormItem>
                        );
                    }}
                />
            )
        )}
        <FormItem>
          <FormLabel>NOK Count</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={codings?.filter(c => c.name !== "OK").reduce((sum, c) => sum + (c.summary ?? 0), 0) ?? 0}
              readOnly
              tabIndex={-1}
              className="text-center h-10 bg-muted cursor-not-allowed"
            />
          </FormControl>
        </FormItem>
        <FormField
          control={form.control}
          name="productionTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Production Time</FormLabel>
              {renderNumericInput(field, true, 0, 60)}
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
              {renderNumericInput(field, true, 0)}
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
              {renderNumericInput(field, true, 0)}
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <hr className="my-6" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {codings?.map((coding, index) => {
            const description = getNokDescription(coding.name);
            if (!description) return null;

            if (isLoading && !initialData) {
              return (
                <FormItem key={`${coding.name}-${index}`}>
                  <FormLabel>{description}</FormLabel>
                  <Skeleton className="h-10 w-full" />
                </FormItem>
              )
            }

            const min = coding.errorCodes.filter(ec => ec.code !== -9999).reduce((sum, ec) => sum + (ec.count || 0), 0);
        
            return (
              <FormField
                key={`${coding.name}-${index}`}
                control={form.control}
                name={`codings.${index}.summary`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{description}</FormLabel>
                    {renderNumericInput(field, false, min)}
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