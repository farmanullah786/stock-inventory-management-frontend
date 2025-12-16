import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockInSchema, StockInFormData } from "@/schemas/stock-in-schema";
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

const defaultValues = {
  productId: 0,
  date: new Date().toISOString().split("T")[0],
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  currency: "AFN",
  poNumber: "",
  invoiceNo: "",
  vendorName: "",
  grnNo: "",
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  stockKeeperId: undefined,
  remarks: "",
};

type StockInFormProps =
  | { action: "create"; products: any[]; users: any[] }
  | {
      action: "update";
      stockIn: StockInFormData;
      stockInId: number;
      products: any[];
      users: any[];
    };

export function StockInFormDialog(props: StockInFormProps) {
  const { action, products, users } = props;

  const form = useForm<StockInFormData>({
    resolver: zodResolver(stockInSchema),
    defaultValues,
    values: action === "update" ? props.stockIn : undefined,
  });

  const addMutation = useAddStockIn();
  const updateMutation = useUpdateStockIn();

  const onSubmit = async (data: StockInFormData) => {
    // Calculate totalPrice if unitPrice and quantity are provided
    if (data.unitPrice && data.quantity) {
      data.totalPrice = data.unitPrice * data.quantity;
    }
    
    // Extract year and month from date if not provided
    if (data.date && !data.year) {
      const dateObj = new Date(data.date);
      data.year = dateObj.getFullYear();
      data.month = dateObj.getMonth() + 1;
    }

    if (action === "update") {
      updateMutation.mutate({ id: props.stockInId, data });
      return;
    }
    addMutation.mutate(data);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const title = action === "update" ? "Edit Stock In" : "Add Stock In";
  const description =
    action === "update"
      ? "Modify stock in record details as needed."
      : "Record incoming stock by filling out the details below.";
  const btnTitle = action === "update" ? "Save Changes" : "Create Record";

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
                      value={field.value ? String(field.value) : ""}
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
                      <DatePicker placeholder="Select date" {...field} />
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
                        defaultValue={field.value || "AFN"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AFN">AFN</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="PKR">PKR</SelectItem>
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
                        <Input placeholder="Vendor name" {...field} />
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
                        <Input placeholder="PO Number" {...field} />
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
                        <Input placeholder="Invoice Number" {...field} />
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
                        <Input placeholder="GRN Number" {...field} />
                      </FormControl>
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
                          field.onChange(value ? parseInt(value) : undefined)
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stock keeper" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
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
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2000"
                          max="2100"
                          placeholder="Year"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || undefined)
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((month, index) => (
                            <SelectItem
                              key={month}
                              value={String(index + 1)}
                            >
                              {month}
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
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or comments"
                        rows="3"
                        {...field}
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
          <Button disabled={isPending} form="stock-in-form" type="submit">
            {isPending ? "Saving..." : btnTitle}
          </Button>
        </DialogFooter>
    </DialogContent>
  );
};

export default StockInFormDialog;
