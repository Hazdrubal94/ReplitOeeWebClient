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
import { GetProductionEvent, CreateProductionEvent, UpdateProductionEvent, createProductionEventSchema, updateProductionEventSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductionEventFormProps {
  reportId: string;
  userName: string;
  initialData?: GetProductionEvent;
  onSuccess: () => void;
}

const productionEventFormSchema = z.object({
  startTime: z.string().nonempty({ message: "Start time is required." }),
  stopTime: z.string().nonempty({ message: "Stop time is required." }),
  category: z.string().nonempty({ message: "Category is required." }),
  machine: z.string().nonempty({ message: "Machine is required." }),
  description: z.string(),
});

type ProductionEventFormValues = z.infer<typeof productionEventFormSchema>;

export default function ProductionEventForm({ reportId, userName, initialData, onSuccess }: ProductionEventFormProps) {
  const { toast } = useToast();
  const form = useForm<ProductionEventFormValues>({
    resolver: zodResolver(productionEventFormSchema),
    defaultValues: initialData
      ? {
          startTime: initialData.startTime,
          stopTime: initialData.stopTime,
          category: initialData.category,
          machine: initialData.machine,
          description: initialData.description,
        }
      : {
          startTime: "",
          stopTime: "",
          category: "",
          machine: "",
          description: "",
        },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductionEvent) => api.createProductionEvent(reportId, data),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to create event", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductionEvent) => api.updateProductionEvent(reportId, initialData!.id, data),
    onSuccess,
    onError: (err: Error) => {
      toast({ title: "Failed to update event", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: ProductionEventFormValues) => {
    if (initialData) {
      const dataToParse = { ...values, userName };
      const parsedData = updateProductionEventSchema.parse(dataToParse);
      updateMutation.mutate(parsedData);
    } else {
      const dataToParse = { ...values, idReport: reportId, userName };
      const parsedData = createProductionEventSchema.parse(dataToParse);
      createMutation.mutate(parsedData);
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
                  <FormControl>
                    <Input {...field} placeholder="e.g., Maintenance" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="machine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Machine</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Assembly Line 1" />
                  </FormControl>
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
