import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  purchaseRequestSchema,
  PurchaseRequestFormData,
} from "@/schemas/purchase-request-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
} from "@/hooks/use-purchase-request";
import { DEFAULT_CURRENCY } from "@/constants";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import PurchaseRequestFormHeader from "./purchase-request-form-header";
import UnsavedChangesPrompt from "@/components/ui/unsaved-changes-prompt";

type PurchaseRequestFormProps =
  | { action: "create" }
  | {
      action: "update";
      purchaseRequest: PurchaseRequestFormData;
      purchaseRequestId: number;
    };

const defaultValues: PurchaseRequestFormData = {
  requestedDate: new Date().toISOString().split("T")[0],
  status: "draft",
  priority: "medium",
  justification: "",
  currency: DEFAULT_CURRENCY,
  items: [
    {
      productName: "",
      quantity: 0,
      unitPrice: 0,
      currency: DEFAULT_CURRENCY,
    },
  ],
};

const PurchaseRequestForm = (props: PurchaseRequestFormProps) => {
  const { action } = props;

  const form = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: action === "update" ? props.purchaseRequest : defaultValues,
  });

  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();

  const onSubmit = (data: PurchaseRequestFormData) => {
    // Calculate total estimated cost
    const totalCost = data.items.reduce((sum, item) => {
      const price = (item.unitPrice || 0) * (item.quantity || 0);
      item.totalPrice = price;
      return sum + price;
    }, 0);
    data.totalEstimatedCost = totalCost;

    if (action === "update") {
      updateMutation.mutate({ id: props.purchaseRequestId, data });
      return;
    }

    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <PurchaseRequestFormHeader action={action} isPending={isPending} />
      <Container>
        <div className="w-full space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <Form {...form}>
              <UnsavedChangesPrompt />
              <form
                id="form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <BasicDetails />
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </>
  );
};

const BasicDetails = () => {
  const { control } = useFormContext<PurchaseRequestFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="requestedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested Date</FormLabel>
              <FormControl>
                <DatePicker placeholder="Select date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="justification"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Justification</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter justification..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-end">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <FormField
              control={control}
              name={`items.${index}.productName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name (e.g., Computer, Desk)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter unit price"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`items.${index}.justification`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Justification</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter justification..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                productName: "",
                quantity: 0,
                unitPrice: 0,
                currency: DEFAULT_CURRENCY,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestForm;
