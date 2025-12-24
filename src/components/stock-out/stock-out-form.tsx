import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockOutSchema, StockOutFormData } from "@/schemas/stock-out-schema";
import { IProduct, IUser } from "@/types/api";
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
import { Container } from "@/components/shared/container";
import StockOutFormHeader from "./stock-out-form-header";
import UnsavedChangesPrompt from "@/components/ui/unsaved-changes-prompt";
import { useFetchUsers } from "@/hooks/use-user";
import { useFetchProducts } from "@/hooks/use-products";
import { useFetchStockSummary } from "@/hooks/use-stock-summary";
import { useMemo } from "react";
import { IStockSummary } from "@/types/api";

type StockOutFormProps =
  | { action: "create" }
  | {
      action: "update";
      stockOut: StockOutFormData;
      stockOutId: number;
    };

const defaultValues: StockOutFormData = {
  productId: 0,
  date: new Date().toISOString().split("T")[0],
  quantity: 0,
  issuedToId: undefined,
  site: "",
  technicianId: undefined,
  status: "draft" as const,
  location: "",
  scheduledDate: undefined,
  requestNumber: "",
  destinationDocument: "",
  remarks: "",
};

const StockOutForm = (props: StockOutFormProps) => {
  const { action } = props;

  // Fetch data needed for form
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });
  const users = usersData?.data || [];

  const { data: allProductsData } = useFetchProducts();
  const allProducts = allProductsData?.data || [];

  const { data: stockSummaryData } = useFetchStockSummary({ limit: 10000 });
  const stockSummary = stockSummaryData?.data || [];

  // Create a map of productId -> availableStock
  const availableStockMap = useMemo(() => {
    const map = new Map<number, number>();
    stockSummary.forEach((item: IStockSummary) => {
      map.set(item.productId, item.availableStock || 0);
    });
    return map;
  }, [stockSummary]);

  // Filter products to only show those with available stock > 0
  const products = useMemo(() => {
    return allProducts.filter((product: IProduct) => {
      const availableStock = availableStockMap.get(product.id) || 0;
      return availableStock > 0;
    });
  }, [allProducts, availableStockMap]);

  const formDefaultValues = {
    ...defaultValues,
    ...(action === "update" && props.action === "update" ? props.stockOut : {}),
  };

  const form = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema),
    defaultValues: action === "update" && props.action === "update" 
      ? props.stockOut 
      : formDefaultValues,
  });

  const createMutation = useAddStockOut();
  const updateMutation = useUpdateStockOut();

  const onSubmit = async (data: StockOutFormData) => {
    if (action === "update") {
      updateMutation.mutate({ id: props.stockOutId, data });
      return;
    }
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <StockOutFormHeader action={action} isPending={isPending} />
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
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? String(field.value) : undefined}
                        disabled={action === "update"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location/Warehouse</FormLabel>
                        <FormControl>
                          <Input placeholder="Source location" {...field} />
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
                            placeholder="Planned shipping date" 
                            {...field}
                            value={field.value || undefined}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Request/Order number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Document</FormLabel>
                        <FormControl>
                          <Input placeholder="Sales order, delivery note" {...field} />
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </>
  );
};

export default StockOutForm;

