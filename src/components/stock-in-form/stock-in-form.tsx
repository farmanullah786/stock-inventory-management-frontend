import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockInSchema, StockInFormData } from "@/schemas/stock-in-schema";
import { IProduct, IUser } from "@/types/api";
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
import { useAddStockIn, useUpdateStockIn } from "@/hooks/use-stock-in";
import { useUser } from "@/store/use-user-store";
import { ROLES, STOCK_IN_STATUS, DEFAULT_CURRENCY, CURRENCIES } from "@/constants";
import { useFetchGoodsReceiptByGrn } from "@/hooks/use-goods-receipt";
import { useEffect } from "react";

const content = {
  create: {
    title: "Add Stock In",
    description: "Record incoming stock by filling out the details below.",
    btnTitle: "Create Record",
  },
  update: {
    title: "Update Stock In",
    description: "Modify stock in record details as needed.",
    btnTitle: "Save Changes",
  },
};

const defaultValues = {
  productId: 0,
  date: new Date().toISOString().split("T")[0],
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  currency: DEFAULT_CURRENCY,
  poNumber: "",
  invoiceNo: "",
  vendorName: "",
  grnNo: "",
  stockKeeperId: undefined,
  location: "",
  scheduledDate: undefined,
  status: STOCK_IN_STATUS.VALIDATED,
  remarks: "",
};

type StockInFormProps =
  | { action: "create"; products: IProduct[]; users: IUser[] }
  | {
      action: "update";
      stockIn: StockInFormData;
      stockInId: number;
      products: IProduct[];
      users: IUser[];
      recordStatus?: string;
      referenceNumber?: string;
      purchaseRequestId?: number;
    };

export function StockInFormDialog(props: StockInFormProps) {
  const { action, products, users } = props;
  const { user } = useUser();
  const isReadOnly = action === "update" && (props.recordStatus === STOCK_IN_STATUS.DONE || props.recordStatus === STOCK_IN_STATUS.CANCELLED);

  // Set default status based on user role (Odoo-style approval workflow)
  // Stock Keepers create as draft, Managers/Admins create as validated
  const defaultStatus: "draft" | "validated" = user.role === ROLES.STOCK_KEEPER ? STOCK_IN_STATUS.DRAFT : STOCK_IN_STATUS.VALIDATED;
  const formDefaultValues = {
    ...defaultValues,
    status: action === "create" ? defaultStatus : (defaultValues.status as "draft" | "validated"),
  };

  const form = useForm<StockInFormData>({
    resolver: zodResolver(stockInSchema),
    defaultValues: formDefaultValues,
    values: action === "update" ? props.stockIn : undefined,
  });

  const addMutation = useAddStockIn();
  const updateMutation = useUpdateStockIn();

  // Watch GRN number for auto-population (only in create mode)
  const grnNo = form.watch("grnNo");
  const { data: goodsReceipt, isLoading: isLoadingGR } = useFetchGoodsReceiptByGrn(
    grnNo || "",
    action === "create" && !!grnNo && grnNo.trim().length > 0
  );

  // Auto-populate fields when GR is fetched
  useEffect(() => {
    if (action === "create" && goodsReceipt && !isLoadingGR) {
      // Get the first item from GR (for single product Stock In entry)
      // In a real scenario, you might want to handle multiple items differently
      const firstItem = goodsReceipt.items?.[0];
      if (firstItem) {
        const prItem = goodsReceipt.purchaseRequest?.items?.find(
          (item) => item.productId === firstItem.productId
        );

        // Auto-populate fields from GR
        form.setValue("productId", firstItem.productId);
        form.setValue("date", goodsReceipt.receivedDate);
        form.setValue("quantity", firstItem.quantityReceived || firstItem.quantityExpected || 0);
        form.setValue("unitPrice", prItem?.unitPrice || 0);
        form.setValue("currency", goodsReceipt.purchaseRequest?.currency || DEFAULT_CURRENCY);
        form.setValue("poNumber", goodsReceipt.purchaseRequest?.prNumber || "");
        form.setValue("stockKeeperId", goodsReceipt.receivedBy);

        // Calculate total price
        const qty = firstItem.quantityReceived || firstItem.quantityExpected || 0;
        const price = prItem?.unitPrice || 0;
        form.setValue("totalPrice", qty * price);
      }
    }
  }, [goodsReceipt, isLoadingGR, action, form]);

  const onSubmit = async (data: StockInFormData) => {
    // Calculate totalPrice if unitPrice and quantity are provided
    if (data.unitPrice && data.quantity) {
      data.totalPrice = data.unitPrice * data.quantity;
    }
    
    // Year and month are auto-calculated in backend from date field

    if (action === "update") {
      updateMutation.mutate({ id: props.stockInId, data });
      return;
    }
    addMutation.mutate(data);
  };

  const { title, description, btnTitle } = content[action];

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent
      className="max-w-2xl"
      onCloseAutoFocus={() => form.reset()}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogBody>
        {action === "update" && props.referenceNumber && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Reference Number: <span className="font-mono">{props.referenceNumber}</span></p>
          </div>
        )}
        <Form {...form}>
          <form
            id="stock-in-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? String(field.value) : undefined}
                      disabled={isReadOnly || (action === "update" && props.purchaseRequestId)}
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
                            {product.name} ({product.category?.name || 'N/A'})
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker placeholder="Select date" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
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
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          field.onChange(value);
                          // Auto-calculate totalPrice if unitPrice exists
                          const unitPrice = form.getValues("unitPrice") || 0;
                          if (unitPrice > 0) {
                            form.setValue("totalPrice", unitPrice * value);
                          }
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          {...field}
                          disabled={isReadOnly}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                            // Auto-calculate totalPrice if quantity exists
                            const quantity = form.getValues("quantity") || 0;
                            if (quantity > 0) {
                              form.setValue("totalPrice", value * quantity);
                            }
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
                  name="totalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          {...field}
                          disabled={isReadOnly}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || DEFAULT_CURRENCY}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={CURRENCIES.AFN}>{CURRENCIES.AFN}</SelectItem>
                          <SelectItem value={CURRENCIES.USD}>{CURRENCIES.USD}</SelectItem>
                          <SelectItem value={CURRENCIES.EUR}>{CURRENCIES.EUR}</SelectItem>
                          <SelectItem value={CURRENCIES.PKR}>{CURRENCIES.PKR}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Vendor name" {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input placeholder="PO Number" {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice N/O</FormLabel>
                      <FormControl>
                        <Input placeholder="Invoice Number" {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grnNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GRN N/O</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter GRN Number to auto-populate fields" 
                          {...field} 
                          disabled={isReadOnly || (action === "update" && props.purchaseRequestId)} 
                        />
                      </FormControl>
                      {isLoadingGR && action === "create" && (
                        <p className="text-sm text-muted-foreground">Loading GR details...</p>
                      )}
                      {goodsReceipt && action === "create" && !isLoadingGR && (
                        <p className="text-sm text-green-600">Fields auto-populated from GR</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockKeeperId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Keeper</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? undefined : parseInt(value))
                        }
                        value={field.value?.toString() || "none"}
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stock keeper" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstName} {user.lastName || ""}
                            </SelectItem>
                          ))}
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Warehouse</FormLabel>
                      <FormControl>
                        <Input placeholder="Storage location" {...field} disabled={isReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <DatePicker 
                          placeholder="Expected arrival date" 
                          {...field}
                          value={field.value || undefined}
                          disabled={isReadOnly}
                        />
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
                      <Textarea
                        placeholder="Additional notes or comments"
                        rows="3"
                        {...field}
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        {!isReadOnly && (
          <Button disabled={isPending} form="stock-in-form">
            {btnTitle}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default StockInFormDialog;
