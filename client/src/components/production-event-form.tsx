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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { GetProductionEvent, CreateUpdateProductionEvent, createUpdateProductionEventSchema, getCategoryDescriptionSchema, getMachineDescriptionSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductionEventFormProps {
  reportId: string;
  userName: string;
  initialData?: GetProductionEvent;
  categoryDescriptions: z.infer<typeof getCategoryDescriptionSchema>[];
  machineDescriptions: z.infer<typeof getMachineDescriptionSchema>[];
  onSuccess: () => void;
}

export default function ProductionEventForm({ reportId, userName, initialData, categoryDescriptions, machineDescriptions, onSuccess }: ProductionEventFormProps) {
  const { toast } = useToast();
  const form = useForm<CreateUpdateProductionEvent>({
    resolver: zodResolver(createUpdateProductionEventSchema),
    defaultValues: {
      startTime: initialData?.startTime ?? "",
      stopTime: initialData?.stopTime ?? "",
      category: initialData?.category ?? 0,
      machineNr: initialData?.machineNr ?? 0,
      description: initialData?.description ?? "",
      userName: userName,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionEvent) => api.createProductionEvent(reportId, data),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateUpdateProductionEvent) => api.updateProductionEvent(reportId, initialData!.id, data),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to update event", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: CreateUpdateProductionEvent) => {
    if (initialData) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
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
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
              name="machineNr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {initialData ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
}
