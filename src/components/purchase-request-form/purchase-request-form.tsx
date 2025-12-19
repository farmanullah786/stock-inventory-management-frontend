import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseRequestSchema, PurchaseRequestFormData } from "@/schemas/purchase-request-schema";
import { IProduct, IUser, IPurchaseRequest } from "@/types/api";
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
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "@/hooks/use-purchase-request";
import { DEFAULT_CURRENCY } from "@/constants";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const content = {
  create: {
    title: "Create Purchase Request",
    description: "Create a new purchase request by filling out the details below.",
    btnTitle: "Create Request",
  },
  update: {
    title: "Edit Purchase Request",
    description: "Modify purchase request details.",
    btnTitle: "Save Changes",
  },
  submit: {
    title: "Submit Purchase Request",
    description: "Submit this purchase request for approval.",
    btnTitle: "Submit",
  },
  approve: {
    title: "Approve Purchase Request",
    description: "Approve this purchase request.",
    btnTitle: "Approve",
  },
  reject: {
    title: "Reject Purchase Request",
    description: "Reject this purchase request. Please provide a reason.",
    btnTitle: "Reject",
  },
};

const defaultValues: PurchaseRequestFormData = {
  requestedDate: new Date().toISOString().split("T")[0],
  status: "draft",
  priority: "medium",
  justification: "",
  currency: DEFAULT_CURRENCY,
  items: [
    {
      productId: 0,
      quantity: 0,
      unitPrice: 0,
      currency: DEFAULT_CURRENCY,
    },
  ],
};

type PurchaseRequestFormProps =
  | { action: "create"; products: IProduct[]; users: IUser[] }
  | {
      action: "update" | "submit" | "approve" | "reject" | "convert";
      purchaseRequest: IPurchaseRequest;
      products: IProduct[];
      users: IUser[];
    };

export default function PurchaseRequestFormDialog(props: PurchaseRequestFormProps) {
  const { action, products, users } = props;
  const [rejectionReason, setRejectionReason] = useState("");

  const isUpdate = action === "update";
  const isSubmit = action === "submit";
  const isApprove = action === "approve";
  const isReject = action === "reject";

  const form = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues,
    values: isUpdate
      ? {
          requestedDate: props.purchaseRequest.requestedDate,
          status: props.purchaseRequest.status,
          priority: props.purchaseRequest.priority,
          justification: props.purchaseRequest.justification || "",
          currency: props.purchaseRequest.currency || "AFN",
          items: props.purchaseRequest.items?.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            currency: item.currency || "AFN",
            justification: item.justification || "",
            specifications: item.specifications || "",
          })) || [],
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();
  const submitMutation = useSubmitPurchaseRequest();
  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();

  const onSubmit = async (data: PurchaseRequestFormData) => {
    // Calculate total estimated cost
    const totalCost = data.items.reduce((sum, item) => {
      const price = (item.unitPrice || 0) * (item.quantity || 0);
      item.totalPrice = price;
      return sum + price;
    }, 0);
    data.totalEstimatedCost = totalCost;

    if (isSubmit) {
      submitMutation.mutate(props.purchaseRequest.id);
      return;
    }
    if (isApprove) {
      approveMutation.mutate(props.purchaseRequest.id);
      return;
    }
    if (isReject) {
      if (!rejectionReason.trim()) {
        form.setError("root", { message: "Rejection reason is required" });
        return;
      }
      rejectMutation.mutate({
        id: props.purchaseRequest.id,
        rejectionReason,
      });
      return;
    }
    if (isUpdate) {
      updateMutation.mutate({ id: props.purchaseRequest.id, data });
      return;
    }
    createMutation.mutate(data);
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  const { title, description, btnTitle } = content[action];

  if (isSubmit || isApprove) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to {isSubmit ? "submit" : "approve"} this purchase request?
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

  if (isReject) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => onSubmit(form.getValues())}
            disabled={isPending || !rejectionReason.trim()}
          >
            {isPending ? "Rejecting..." : "Reject"}
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
            id="purchase-request-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requestedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Date</FormLabel>
                    <FormControl>
                      <DatePicker placeholder="Pick a date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
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
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter justification..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      productId: 0,
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

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
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
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem
                                  key={product.id}
                                  value={String(product.id)}
                                >
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
                                const unitPrice = form.getValues(`items.${index}.unitPrice`) || 0;
                                form.setValue(`items.${index}.totalPrice`, unitPrice * value);
                              }}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                                const quantity = form.getValues(`items.${index}.quantity`) || 0;
                                form.setValue(`items.${index}.totalPrice`, value * quantity);
                              }}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
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
                </div>
              ))}
            </div>
          </form>
        </Form>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button form="purchase-request-form" disabled={isPending}>
          {btnTitle}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

