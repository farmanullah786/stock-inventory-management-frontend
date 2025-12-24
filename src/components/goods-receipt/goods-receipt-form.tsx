import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  goodsReceiptSchema,
  GoodsReceiptFormData,
} from "@/schemas/goods-receipt-schema";
import { IGoodsReceipt, IPurchaseRequest } from "@/types/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ReadOnlyField } from "@/components/ui/read-only-field";
import {
  useCreateGoodsReceipt,
  useUpdateGoodsReceipt,
} from "@/hooks/use-goods-receipt";
import { useFetchPurchaseRequests } from "@/hooks/use-purchase-request";
import { useEffect } from "react";
import { Container } from "@/components/shared/container";
import GoodsReceiptFormHeader from "./goods-receipt-form-header";
import UnsavedChangesPrompt from "@/components/ui/unsaved-changes-prompt";

const defaultValues: GoodsReceiptFormData = {
  purchaseRequestId: 0,
  receivedDate: new Date().toISOString().split("T")[0],
  status: "pending",
  condition: "good",
  items: [
    {
      productName: "",
      quantityReceived: 0,
      quantityExpected: 0,
      condition: "good",
    },
  ],
};

type GoodsReceiptFormProps =
  | { action: "create" }
  | {
      action: "update";
      goodsReceipt: GoodsReceiptFormData;
      goodsReceiptId: number;
    };

const GoodsReceiptForm = (props: GoodsReceiptFormProps) => {
  const { action } = props;
  const isUpdate = action === "update";

  // Fetch data needed for form
  const { data: purchaseRequestsData } = useFetchPurchaseRequests({
    page: 1,
    limit: 1000,
    status: "approved",
  });
  const purchaseRequests = purchaseRequestsData?.data || [];

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: isUpdate ? props.goodsReceipt : defaultValues,
  });

  // Note: Item population from PR is handled in BasicDetails component

  const createMutation = useCreateGoodsReceipt();
  const updateMutation = useUpdateGoodsReceipt();

  const onSubmit = async (data: GoodsReceiptFormData) => {
    if (isUpdate) {
      updateMutation.mutate({ id: props.goodsReceiptId, data });
      return;
    }
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <GoodsReceiptFormHeader action={action} isPending={isPending} />
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
                <BasicDetails
                  purchaseRequests={purchaseRequests}
                  isUpdate={isUpdate}
                />
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </>
  );
};

interface BasicDetailsProps {
  purchaseRequests: IPurchaseRequest[];
  isUpdate: boolean;
}

const BasicDetails = ({ purchaseRequests, isUpdate }: BasicDetailsProps) => {
  const { control, watch, setValue } = useFormContext<GoodsReceiptFormData>();
  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  // When purchaseRequestId changes, populate ALL items from PR
  const selectedPRId = watch("purchaseRequestId");
  useEffect(() => {
    if (
      !isUpdate &&
      selectedPRId &&
      selectedPRId > 0 &&
      purchaseRequests.length > 0
    ) {
      const pr = purchaseRequests.find(
        (pr: IPurchaseRequest) => pr.id === selectedPRId
      );
      if (pr && pr.items && pr.items.length > 0) {
        // Filter PR items to only include those with productName (skip items with null productName)
        // Map PR items with productName to goods receipt items - all data comes from PR
        const items = pr.items
          .filter(
            (prItem) => prItem.productName && prItem.productName.trim() !== ""
          )
          .map((prItem) => {
            // Calculate quantities
            const ordered =
              typeof prItem.quantity === "number"
                ? prItem.quantity
                : parseFloat(String(prItem.quantity)) || 0;
            const received =
              typeof prItem.quantityReceived === "number"
                ? prItem.quantityReceived || 0
                : parseFloat(String(prItem.quantityReceived || 0)) || 0;
            const remaining = Math.max(0, ordered - received);

            return {
              productName: prItem.productName, // Send productName to backend - backend will find product and set productId
              quantityReceived: 0, // Start with 0, user will enter received quantity
              quantityExpected: remaining > 0 ? remaining : ordered, // Expected = remaining to receive
              condition: "good" as const, // Default condition
              remarks: "", // Empty remarks by default
            };
          });

        // Only set items if we have at least one valid item with productName
        if (items.length > 0) {
          setValue("items", items, { shouldValidate: false });
        } else {
          // No items with valid productName found, reset to default
          console.warn(
            `[Goods Receipt Form] PR ${pr.prNumber} has no items with valid productName. ` +
              `Cannot create goods receipt items.`
          );
          setValue("items", defaultValues.items, { shouldValidate: false });
        }
      } else if (pr && (!pr.items || pr.items.length === 0)) {
        // PR has no items, reset to default
        setValue("items", defaultValues.items, { shouldValidate: false });
      }
    } else if (!isUpdate && selectedPRId === 0) {
      // No PR selected, reset to default
      setValue("items", defaultValues.items, { shouldValidate: false });
    }
  }, [selectedPRId, purchaseRequests, isUpdate, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="purchaseRequestId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Request</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value ? String(field.value) : undefined}
                disabled={isUpdate}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase request" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {purchaseRequests.map((pr: IPurchaseRequest) => (
                    <SelectItem key={pr.id} value={String(pr.id)}>
                      {pr.prNumber} - {pr.items?.length || 0} items
                      {pr.items &&
                        pr.items.some(
                          (item) => (item.quantityReceived || 0) > 0
                        ) && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Partial)
                          </span>
                        )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="receivedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Received Date</FormLabel>
              <FormControl>
                <DatePicker placeholder="Select date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter remarks..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        {fields.map((field, index) => {
          const selectedPRId = watch("purchaseRequestId");
          const pr = purchaseRequests.find(
            (pr: IPurchaseRequest) => pr.id === selectedPRId
          );
          const prItem = pr?.items?.[index];
          const productName = prItem?.productName || "";

          return (
            <div key={field.id} className="border p-4 rounded-lg space-y-4">
              {/* Remove button removed - items come from PR and cannot be removed */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Product Name - Read-only (from PR item) */}
                <FormField
                  control={control}
                  name={`items.${index}.productName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      {/* Hidden input to store productName for form submission */}
                      <input type="hidden" {...field} />
                      <FormControl>
                        <ReadOnlyField value={productName || "-"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`items.${index}.condition`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Quantity Expected - Read-only (calculated from PR remaining) */}
                <FormField
                  control={control}
                  name={`items.${index}.quantityExpected`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Expected</FormLabel>
                      {/* Hidden input to store quantityExpected for form submission */}
                      <input type="hidden" {...field} />
                      <FormControl>
                        <ReadOnlyField value={field.value || 0} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`items.${index}.quantityReceived`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity Received</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Received quantity"
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
                name={`items.${index}.remarks`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter remarks..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
        {/* Add Item button removed - items are auto-populated from PR */}
      </div>
    </div>
  );
};

export default GoodsReceiptForm;
