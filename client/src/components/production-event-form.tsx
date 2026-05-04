import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Minus, Plus } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import {
  CreateUpdateProductionEvent,
  GetProductionEvent,
  GetSubcategoryDescription,
  createUpdateProductionEventSchema,
  getCategoryDescriptionSchema,
  getMachineDescriptionSchema,
} from "@shared/schema";

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

interface ProductionEventFormProps {
  reportId: string;
  userName: string;
  reportArea: string;
  initialData?: GetProductionEvent;
  categoryDescriptions: z.infer<typeof getCategoryDescriptionSchema>[];
  machineDescriptions: z.infer<typeof getMachineDescriptionSchema>[];
  onSuccess: () => void;
}

export default function ProductionEventForm({ reportId, userName, reportArea, initialData, categoryDescriptions, machineDescriptions, onSuccess }: ProductionEventFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateUpdateProductionEvent>({
    resolver: zodResolver(createUpdateProductionEventSchema),
    defaultValues: {
      startTime: initialData?.startTime ?? undefined,
      stopTime: initialData?.stopTime ?? undefined,
      category: initialData?.category ?? undefined,
      subcategory: initialData?.subcategory ?? null,
      pn: initialData?.pn ?? undefined,
      fert: initialData?.fert ?? undefined,
      isAvailabilityLoss: initialData?.isAvailabilityLoss ?? false,
      machineNr: initialData?.machineNr ?? undefined,
      description: initialData?.description ?? "",
      userName: userName,
    },
  });

  const startTime = form.watch("startTime");
  const stopTime = form.watch("stopTime");
  const categoryId = form.watch("category");

  const [duration, setDuration] = useState<number>(() => {
    if (!initialData?.startTime || !initialData?.stopTime) return 0;
    const startMin = timeToMinutes(initialData.startTime);
    const stopMin = timeToMinutes(initialData.stopTime);
    return stopMin >= startMin ? stopMin - startMin : 0;
  });

  useEffect(() => {
    if (!startTime) return;
    const expectedStop = timeToMinutes(startTime) + duration;
    if (stopTime && timeToMinutes(stopTime) === expectedStop) return;
    form.setValue("stopTime", minutesToTime(expectedStop), {
      shouldValidate: true,
    });
  }, [startTime, duration]);

  useEffect(() => {
    if (!startTime || !stopTime) return;

    const startMin = timeToMinutes(startTime);
    const stopMin = timeToMinutes(stopTime);

    if (stopMin < startMin) {
      form.setValue("stopTime", minutesToTime(startMin));
      setDuration(0);
    } else {
      setDuration(stopMin - startMin);
    }
  }, [stopTime]);

  const { data: pns = [], isLoading: isLoadingPns } = useQuery<string[]>({ 
    queryKey: [`/api/ProductionReports/PNs?area=${reportArea}`],
    queryFn: () => api.getPNs(reportArea),
    enabled: !!reportArea,
  });

  const { data: subcategories, isLoading: isLoadingSubcategories } = useQuery<GetSubcategoryDescription[] | null>({
      queryKey: [`/api/ProductionReports/Categories/${categoryId}/Subcategories`],
      queryFn: () => api.getSubcategoriesForCategoryId(categoryId!),
      enabled: !!categoryId && categoryId !== 0,
    });

  const createMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionEvent) => api.createProductionEvent(reportId, data),
    onSuccess: () => {
      onSuccess();
      toast({ title: "Production Event Created", description: "The production event has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionEvent) => api.updateProductionEvent(reportId, initialData!.id, data),
    onSuccess: () => {
      onSuccess();
      toast({ title: "Production Event Updated", description: "The production event has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update event", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: CreateUpdateProductionEvent) => initialData?.id ? updateMutation.mutate(values) : createMutation.mutate(values);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input required type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stopTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stop Time</FormLabel>
                <FormControl>
                  <Input
                    required
                    type="time"
                    {...field}
                    min={startTime || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Duration (min)</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDuration((d) => Math.max(0, d - 1))}
                >
                  <Minus />
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) =>
                    setDuration(Math.max(0, Number(e.target.value)))
                  }
                  className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDuration((d) => d + 1)}
                >
                  <Plus />
                </Button>
              </div>
            </FormControl>
          </FormItem>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PN</FormLabel>
                <Select required onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingPns}>
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
                      <SelectValue placeholder={isLoadingPns ? "Loading..." : "Select a FERT"} />
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
            name="machineNr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine</FormLabel>
                <Select required onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={!!field.value ? String(field.value) : undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a machine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {machineDescriptions.map((machine) => (
                      <SelectItem key={machine.id} value={String(machine.id)}>
                        {machine.machine} - {machine.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    required
                    onValueChange={(value) => {
                      field.onChange(parseInt(value, 10));
                      form.setValue("subcategory", null);
                    }}
                    defaultValue={!!field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryDescriptions.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.description}
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
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value, 10))}
                    value={String(field.value ?? 'null')}
                    disabled={!categoryId || categoryId === 0 || isLoadingSubcategories}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {subcategories?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                          {subcategory.descriptionEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a short description of the event..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between items-center">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {initialData?.id ? 'Update Event' : 'Create Event'}
          </Button>
          <FormField
            control={form.control}
            name="isAvailabilityLoss"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormLabel>Availability Loss</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
