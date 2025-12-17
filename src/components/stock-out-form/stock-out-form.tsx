import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockOutSchema, StockOutFormData } from "@/schemas/stock-out-schema";
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
import { useAddStockOut, useUpdateStockOut } from "@/hooks/use-stock-out";

const defaultValues = {
  productId: 0,
  date: new Date().toISOString().split("T")[0],
  quantity: 0,
  issuedToId: undefined,
  site: "",
  technicianId: undefined,
  remarks: "",
};

type StockOutFormProps =
  | { action: "create"; products: IProduct[]; users: IUser[] }
  | {
      action: "update";
      stockOut: StockOutFormData;
      stockOutId: number;
      products: IProduct[];
      users: IUser[];
    };

export function StockOutFormDialog(props: StockOutFormProps) {
  const { action, products, users } = props;

  const form = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema),
    defaultValues,
    values: action === "update" ? props.stockOut : undefined,
  });

  const addMutation = useAddStockOut();
  const updateMutation = useUpdateStockOut();

  const onSubmit = async (data: StockOutFormData) => {
    if (action === "update") {
      updateMutation.mutate({ id: props.stockOutId, data });
      return;
    }
    addMutation.mutate(data);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const title = action === "update" ? "Edit Stock Out" : "Add Stock Out";
  const description =
    action === "update"
      ? "Modify stock out record details as needed."
      : "Record outgoing stock by filling out the details below.";
  const btnTitle = action === "update" ? "Save Changes" : "Create Record";

  return (
    <DialogContent
      className="max-w-md"
      onCloseAutoFocus={() => form.reset()}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              id="stock-out-form"
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

              <FormField
                control={form.control}
                name="issuedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issued To</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : parseInt(value))
                      }
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
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

              <FormField
                control={form.control}
                name="site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input placeholder="Site location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : parseInt(value))
                      }
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technician" />
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
          <Button disabled={isPending} form="stock-out-form" type="submit">
            {isPending ? "Saving..." : btnTitle}
          </Button>
        </DialogFooter>
    </DialogContent>
  );
};

export default StockOutFormDialog;
