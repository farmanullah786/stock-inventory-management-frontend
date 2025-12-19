import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goodsReceiptSchema, GoodsReceiptFormData } from "@/schemas/goods-receipt-schema";
import { IProduct, IUser, IGoodsReceipt, IPurchaseRequest } from "@/types/api";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  useCreateGoodsReceipt,
  useUpdateGoodsReceipt,
  useVerifyGoodsReceipt,
} from "@/hooks/use-goods-receipt";
import { useFetchPurchaseRequests } from "@/hooks/use-purchase-request";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

const content = {
  create: {
    title: "Create Goods Receipt",
    description: "Create a new goods receipt by filling out the details below.",
    btnTitle: "Create Receipt",
  },
  update: {
    title: "Update Goods Receipt",
    description: "Modify goods receipt details.",
    btnTitle: "Save Changes",
  },
  verify: {
    title: "Verify Goods Receipt",
    description: "Verify this goods receipt. Stock will be added to inventory upon verification.",
    btnTitle: "Verify",
  },
};

const defaultValues: GoodsReceiptFormData = {
  purchaseRequestId: 0,
  receivedDate: new Date().toISOString().split("T")[0],
  status: "pending",
  condition: "good",
  items: [
    {
      productId: 0,
      quantityReceived: 0,
      quantityExpected: 0,
      condition: "good",
    },
  ],
};

type GoodsReceiptFormProps =
  | {
      action: "create";
      products: IProduct[];
      users: IUser[];
      purchaseRequest?: IPurchaseRequest;
    }
  | {
      action: "update" | "verify";
      goodsReceipt: IGoodsReceipt;
      products: IProduct[];
      users: IUser[];
    };

export default function GoodsReceiptFormDialog(props: GoodsReceiptFormProps) {
  const { action, products, users } = props;
  const isUpdate = action === "update";
  const isVerify = action === "verify";
  const isCreate = action === "create";
  const purchaseRequest = isCreate ? props.purchaseRequest : undefined;

  // Fetch approved purchase requests for selection (only if not creating from specific PR)
  const { data: purchaseRequestsData } = useFetchPurchaseRequests({
    page: 1,
    limit: 1000,
    status: "approved",
  });
  const purchaseRequests = purchaseRequestsData?.data || [];

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: purchaseRequest
      ? {
          ...defaultValues,
          purchaseRequestId: purchaseRequest.id,
        }
      : defaultValues,
    values: isUpdate
      ? {
          purchaseRequestId: props.goodsReceipt.purchaseRequestId || 0,
          receivedDate: props.goodsReceipt.receivedDate,
          status: props.goodsReceipt.status,
          condition: props.goodsReceipt.condition,
          remarks: props.goodsReceipt.remarks || "",
          items: props.goodsReceipt.items?.map((item) => ({
            productId: item.productId,
            quantityReceived: item.quantityReceived,
            quantityExpected: item.quantityExpected,
            condition: item.condition,
            remarks: item.remarks || "",
          })) || [],
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // When purchaseRequestId changes, populate items from PR
  const selectedPRId = form.watch("purchaseRequestId");
  useEffect(() => {
    if (!isUpdate && !purchaseRequest && selectedPRId && purchaseRequests.length > 0) {
      const pr = purchaseRequests.find((pr: IPurchaseRequest) => pr.id === selectedPRId);
      if (pr && pr.items) {
        // Pre-populate items from PR with remaining quantities
        const items = pr.items.map((item) => {
          const ordered = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
          const received = typeof item.quantityReceived === 'number' ? (item.quantityReceived || 0) : parseFloat(String(item.quantityReceived || 0)) || 0;
          const remaining = ordered - received;
          return {
            productId: item.productId,
            quantityReceived: 0,
            quantityExpected: remaining > 0 ? remaining : ordered,
            condition: "good" as const,
          };
        });
        form.setValue("items", items);
      }
    } else if (purchaseRequest && purchaseRequest.items) {
      // Pre-populate from provided PR
      const items = purchaseRequest.items.map((item) => {
        const ordered = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
        const received = typeof item.quantityReceived === 'number' ? (item.quantityReceived || 0) : parseFloat(String(item.quantityReceived || 0)) || 0;
        const remaining = ordered - received;
        return {
          productId: item.productId,
          quantityReceived: 0,
          quantityExpected: remaining > 0 ? remaining : ordered,
          condition: "good" as const,
        };
      });
      form.setValue("items", items);
    }
  }, [selectedPRId, purchaseRequests, purchaseRequest, isUpdate, form]);

  const createMutation = useCreateGoodsReceipt();
  const updateMutation = useUpdateGoodsReceipt();
  const verifyMutation = useVerifyGoodsReceipt();

  const onSubmit = async (data: GoodsReceiptFormData) => {
    if (isVerify) {
      verifyMutation.mutate(props.goodsReceipt.id);
      return;
    }
    if (isUpdate) {
      updateMutation.mutate({ id: props.goodsReceipt.id, data });
      return;
    }
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending || verifyMutation.isPending;

  const { title, description, btnTitle } = content[action];

  if (isVerify) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to verify this goods receipt?
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSubmit(form.getValues())} disabled={isPending}>
            {btnTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl" onCloseAutoFocus={() => form.reset()}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Form {...form}>
          <form
            id="goods-receipt-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseRequestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Request</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? String(field.value) : undefined}
                      disabled={isUpdate || !!purchaseRequest}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purchase request" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purchaseRequest ? (
                          <SelectItem value={String(purchaseRequest.id)}>
                            {purchaseRequest.prNumber} - {purchaseRequest.items?.length || 0} items
                          </SelectItem>
                        ) : (
                          purchaseRequests.map((pr: IPurchaseRequest) => (
                            <SelectItem key={pr.id} value={String(pr.id)}>
                              {pr.prNumber} - {pr.items?.length || 0} items
                              {pr.items && pr.items.some((item) => (item.quantityReceived || 0) > 0) && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (Partial)
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received Date</FormLabel>
                    <FormControl>
                      <DatePicker placeholder="Pick a date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter remarks..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                {!isUpdate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        productId: 0,
                        quantityReceived: 0,
                        quantityExpected: 0,
                        condition: "good",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </div>

              {fields.map((field, index) => {
                const product = products.find((p) => p.id === form.watch(`items.${index}.productId`));
                return (
                  <div key={field.id} className="border p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && !isUpdate && (
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value ? String(field.value) : undefined}
                              disabled={isUpdate}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={String(product.id)}>
                                    {product.name}
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
                        name={`items.${index}.condition`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantityExpected`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity Expected {product && `(${product.unit})`}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Expected quantity"
                                {...field}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                                disabled={isUpdate}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantityReceived`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity Received {product && `(${product.unit})`}</FormLabel>
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
                      control={form.control}
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
            </div>
          </form>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <Button form="goods-receipt-form" disabled={isPending}>
          {btnTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

