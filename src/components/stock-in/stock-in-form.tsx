import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockInSchema,
  StockInFormData,
  StockInUpdateFormData,
} from "@/schemas/stock-in-schema";
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
import { useAddStockIn, useUpdateStockIn } from "@/hooks/use-stock-in";
import { useUser } from "@/store/use-user-store";
import { ROLES, STOCK_IN_STATUS, DEFAULT_CURRENCY } from "@/constants";
import {
  useFetchGoodsReceipts,
  useFetchGoodsReceipt,
} from "@/hooks/use-goods-receipt";
import { useEffect } from "react";
import { Container } from "@/components/shared/container";
import StockInFormHeader from "./stock-in-form-header";
import UnsavedChangesPrompt from "@/components/ui/unsaved-changes-prompt";
import { useFetchUsers } from "@/hooks/use-user";
import { ReadOnlyField } from "@/components/ui/read-only-field";

type StockInFormProps =
  | { action: "create" }
  | {
      action: "update";
      stockIn: StockInUpdateFormData & { productId?: number };
      stockInId: number;
    };

const defaultValues: StockInFormData = {
  goodsReceiptId: 0,
  items: [],
  status: STOCK_IN_STATUS.VALIDATED,
};

const defaultUpdateValues: StockInUpdateFormData = {
  goodsReceiptId: 0,
  productName: "",
  invoiceNo: "",
  vendorName: "",
  stockKeeperId: undefined,
  status: STOCK_IN_STATUS.VALIDATED,
  remarks: "",
};

const StockInForm = (props: StockInFormProps) => {
  const { action } = props;
  const { user } = useUser();

  // Fetch data needed for form
  const { data: usersData } = useFetchUsers({ page: 1, limit: 1000 });
  const users = usersData?.data || [];

  // Fetch goods receipts for GRN dropdown (only verified ones for stock in)
  const { data: goodsReceiptsData } = useFetchGoodsReceipts({
    page: 1,
    limit: 1000,
    verified: true, // Only fetch verified goods receipts from backend
  });
  const goodsReceipts = goodsReceiptsData?.data || [];

  // Set default status based on user role
  const defaultStatus: "draft" | "validated" =
    user.role === ROLES.STOCK_KEEPER
      ? STOCK_IN_STATUS.DRAFT
      : STOCK_IN_STATUS.VALIDATED;

  const formDefaultValues = {
    ...(action === "create" ? defaultValues : defaultUpdateValues),
    status: action === "create" ? defaultStatus : defaultUpdateValues.status,
  };

  const form = useForm<StockInFormData | StockInUpdateFormData>({
    resolver: zodResolver(stockInSchema),
    defaultValues:
      action === "update" && props.action === "update"
        ? props.stockIn
        : formDefaultValues,
  });

  // Use field array only for create action
  const { fields } = useFieldArray({
    control: form.control,
    name: action === "create" ? "items" : ("items" as any),
  });

  const createMutation = useAddStockIn();
  const updateMutation = useUpdateStockIn();

  // Watch Goods Receipt ID and fetch full GR details when selected
  const goodsReceiptId = form.watch("goodsReceiptId");
  const { data: selectedGoodsReceipt, isLoading: isLoadingGR } =
    useFetchGoodsReceipt(goodsReceiptId || 0);

  // Auto-populate items array when GR is selected (create action only)
  useEffect(() => {
    if (
      action === "create" &&
      selectedGoodsReceipt &&
      selectedGoodsReceipt.items
    ) {
      // Create form items array from GR items
      const formItems = selectedGoodsReceipt.items.map((grItem) => ({
        productName: grItem.productName || "",
        vendorName: "",
        invoiceNo: "",
        stockKeeperId: undefined,
        remarks: "",
      }));
      form.setValue("items", formItems);
    }
  }, [selectedGoodsReceipt, action, form]);

  const onSubmit = async (data: StockInFormData | StockInUpdateFormData) => {
    // Validate required fields
    if (!data.goodsReceiptId || data.goodsReceiptId === 0) {
      form.setError("goodsReceiptId" as any, {
        message: "Please select a Goods Receipt.",
      });
      return;
    }

    if (action === "update") {
      updateMutation.mutate({
        id: props.stockInId,
        data: data as StockInUpdateFormData,
      });
      return;
    }

    // For create action, validate items array
    const createData = data as StockInFormData;
    if (!createData.items || createData.items.length === 0) {
      form.setError("items" as any, {
        message: "At least one item is required.",
      });
      return;
    }

    // All duplicate fields (date, quantity, unitPrice, totalPrice, poNumber, grnNo)
    // are auto-populated by the backend from GR/PR data

    createMutation.mutate(createData);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Get GR item details for display (create action only)
  const getGrItemByIndex = (index: number) => {
    if (!selectedGoodsReceipt?.items) return null;
    return selectedGoodsReceipt.items[index] || null;
  };

  const getPrItemByProductName = (productName: string) => {
    if (!selectedGoodsReceipt?.purchaseRequest?.items || !productName)
      return null;
    return (
      selectedGoodsReceipt.purchaseRequest.items.find(
        (item) =>
          item.productName?.toLowerCase().trim() ===
          productName.toLowerCase().trim()
      ) || null
    );
  };

  // Get GR item by productName for create action
  const getGrItemByProductName = (productName: string) => {
    if (!selectedGoodsReceipt?.items || !productName) return null;
    return (
      selectedGoodsReceipt.items.find(
        (item) =>
          item.productName?.toLowerCase().trim() ===
          productName.toLowerCase().trim()
      ) || null
    );
  };

  // Get GR item by productId for update action (more reliable matching)
  // Falls back to productName if productId is null
  const getGrItemByProductId = (productId?: number, productName?: string) => {
    if (!selectedGoodsReceipt?.items) return null;

    // First try to match by productId if both have it
    if (productId) {
      const itemById = selectedGoodsReceipt.items.find(
        (item) => item.productId === productId
      );
      if (itemById) return itemById;
    }

    // Fallback to productName matching if productId match failed or productId is null
    if (productName) {
      return (
        selectedGoodsReceipt.items.find(
          (item) =>
            item.productName?.toLowerCase().trim() ===
            productName.toLowerCase().trim()
        ) || null
      );
    }

    return null;
  };

  return (
    <>
      <StockInFormHeader action={action} isPending={isPending} />
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
                {/* GRN Number - Full Width at Top - Dropdown Selection (stores goodsReceiptId) */}
                <FormField
                  control={form.control}
                  name="goodsReceiptId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GRN N/O</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const grId = parseInt(value);
                          field.onChange(grId);
                          // Reset items when GR changes
                          if (action === "create") {
                            form.setValue("items", []);
                          }
                        }}
                        value={
                          field.value && field.value !== 0
                            ? field.value.toString()
                            : undefined
                        }
                        disabled={action === "update"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select GRN Number" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goodsReceipts.map((gr) => (
                            <SelectItem key={gr.id} value={gr.id.toString()}>
                              {gr.grnNumber}
                              {gr.purchaseRequest && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({gr.purchaseRequest.prNumber})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedGoodsReceipt && action === "create" && (
                        <p className="text-sm text-green-600">
                          Fields auto-populated from GR
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Create Action: Show items array with individual fields per item */}
                {action === "create" && (
                  <div className="space-y-6">
                    {selectedGoodsReceipt && fields.length > 0 ? (
                      <>
                        <h3 className="text-sm font-semibold">
                          Items from GR ({fields.length} items)
                        </h3>
                        {fields.map((field, index) => {
                          const grItem = getGrItemByIndex(index);
                          const itemValues = form.watch(`items.${index}`) as
                            | { productName: string }
                            | undefined;
                          const productName =
                            itemValues?.productName ||
                            grItem?.productName ||
                            "";
                          const prItem = getPrItemByProductName(productName);

                          return (
                            <div
                              key={field.id}
                              className="border p-6 rounded-lg space-y-4 bg-muted/30"
                            >
                              {/* Read-only GR Item Info */}
                              <div className="space-y-3 pb-4 border-b">
                                <ReadOnlyField
                                  label="Product Name"
                                  value={grItem?.productName || "-"}
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                  <ReadOnlyField
                                    label="Quantity Expected"
                                    value={grItem?.quantityExpected || 0}
                                  />
                                  <ReadOnlyField
                                    label="Quantity Received"
                                    value={grItem?.quantityReceived || 0}
                                  />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                  <ReadOnlyField
                                    label="Unit Price"
                                    value={
                                      prItem?.unitPrice !== undefined &&
                                      prItem?.unitPrice !== null
                                        ? `${Number(prItem.unitPrice).toFixed(
                                            2
                                          )} ${
                                            selectedGoodsReceipt.purchaseRequest
                                              ?.currency || DEFAULT_CURRENCY
                                          }`
                                        : "-"
                                    }
                                  />
                                  <ReadOnlyField
                                    label="Total Price"
                                    value={
                                      prItem?.unitPrice !== undefined &&
                                      prItem?.unitPrice !== null &&
                                      grItem?.quantityReceived
                                        ? `${(
                                            Number(prItem.unitPrice) *
                                            Number(grItem.quantityReceived)
                                          ).toFixed(2)} ${
                                            selectedGoodsReceipt.purchaseRequest
                                              ?.currency || DEFAULT_CURRENCY
                                          }`
                                        : prItem?.unitPrice !== undefined &&
                                          prItem?.unitPrice !== null &&
                                          grItem?.quantityExpected
                                        ? `${(
                                            Number(prItem.unitPrice) *
                                            Number(grItem.quantityExpected)
                                          ).toFixed(2)} ${
                                            selectedGoodsReceipt.purchaseRequest
                                              ?.currency || DEFAULT_CURRENCY
                                          }`
                                        : "-"
                                    }
                                  />
                                </div>
                                {grItem?.condition && (
                                  <ReadOnlyField
                                    label="Condition"
                                    value={
                                      grItem.condition.charAt(0).toUpperCase() +
                                      grItem.condition.slice(1)
                                    }
                                  />
                                )}
                              </div>

                              {/* Editable Stock In Fields per Item */}
                              <div className="space-y-4">
                                {/* Hidden productName field */}
                                <input
                                  type="hidden"
                                  {...form.register(
                                    `items.${index}.productName`
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.vendorName`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Vendor Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Vendor name"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.invoiceNo`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Invoice N/O</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Invoice Number"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`items.${index}.stockKeeperId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Stock Keeper</FormLabel>
                                      <Select
                                        onValueChange={(value) =>
                                          field.onChange(
                                            value === "none"
                                              ? undefined
                                              : parseInt(value)
                                          )
                                        }
                                        value={
                                          field.value?.toString() || "none"
                                        }
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select stock keeper" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="none">
                                            None
                                          </SelectItem>
                                          {users.map((user) => (
                                            <SelectItem
                                              key={user.id}
                                              value={user.id.toString()}
                                            >
                                              {user.firstName}{" "}
                                              {user.lastName || ""}
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
                                  name={`items.${index}.remarks`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Remarks</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Additional notes or comments for this item"
                                          rows="3"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      /* Show empty ReadOnlyFields when no GR is selected */
                      <div className="border p-6 rounded-lg space-y-4 bg-muted/30">
                        <div className="space-y-3 pb-4 border-b">
                          <ReadOnlyField label="Product Name" value="-" />
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                            <ReadOnlyField
                              label="Quantity Expected"
                              value="-"
                            />
                            <ReadOnlyField
                              label="Quantity Received"
                              value="-"
                            />
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                            <ReadOnlyField label="Unit Price" value="-" />
                            <ReadOnlyField label="Total Price" value="-" />
                          </div>
                          <ReadOnlyField label="Condition" value="-" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Update Action: Show single item form with GR item info */}
                {action === "update" && (
                  <>
                    {/* Read-only GR Item Info */}
                    {selectedGoodsReceipt &&
                      (() => {
                        // Use productId for matching (with fallback to productName if productId is null in GR item)
                        const productId =
                          props.action === "update"
                            ? props.stockIn.productId
                            : undefined;
                        const productName = form.watch("productName") as string;

                        // Try matching by productId first, fallback to productName (handles case when GR item has productId: null)
                        const grItem = getGrItemByProductId(
                          productId,
                          productName
                        );

                        // Get PR item for price display
                        const prItemProductName =
                          grItem?.productName || productName;
                        const prItem =
                          getPrItemByProductName(prItemProductName);

                        return (
                          <div className="border p-6 rounded-lg space-y-4 bg-muted/30 mb-6">
                            <div className="space-y-3 pb-4 border-b">
                              <ReadOnlyField
                                label="Product Name"
                                value={
                                  grItem?.productName || productName || "-"
                                }
                              />
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                <ReadOnlyField
                                  label="Quantity Expected"
                                  value={grItem?.quantityExpected || "-"}
                                />
                                <ReadOnlyField
                                  label="Quantity Received"
                                  value={grItem?.quantityReceived || "-"}
                                />
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                <ReadOnlyField
                                  label="Unit Price"
                                  value={
                                    prItem?.unitPrice !== undefined &&
                                    prItem?.unitPrice !== null
                                      ? `${Number(prItem.unitPrice).toFixed(
                                          2
                                        )} ${
                                          selectedGoodsReceipt.purchaseRequest
                                            ?.currency || DEFAULT_CURRENCY
                                        }`
                                      : "-"
                                  }
                                />
                                <ReadOnlyField
                                  label="Total Price"
                                  value={
                                    prItem?.unitPrice !== undefined &&
                                    prItem?.unitPrice !== null &&
                                    grItem?.quantityReceived
                                      ? `${(
                                          Number(prItem.unitPrice) *
                                          Number(grItem.quantityReceived)
                                        ).toFixed(2)} ${
                                          selectedGoodsReceipt.purchaseRequest
                                            ?.currency || DEFAULT_CURRENCY
                                        }`
                                      : prItem?.unitPrice !== undefined &&
                                        prItem?.unitPrice !== null &&
                                        grItem?.quantityExpected
                                      ? `${(
                                          Number(prItem.unitPrice) *
                                          Number(grItem.quantityExpected)
                                        ).toFixed(2)} ${
                                          selectedGoodsReceipt.purchaseRequest
                                            ?.currency || DEFAULT_CURRENCY
                                        }`
                                      : "-"
                                  }
                                />
                              </div>
                              {grItem?.condition && (
                                <ReadOnlyField
                                  label="Condition"
                                  value={
                                    grItem.condition.charAt(0).toUpperCase() +
                                    grItem.condition.slice(1)
                                  }
                                />
                              )}
                            </div>
                          </div>
                        );
                      })()}

                    {/* Editable Stock In Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="stockKeeperId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Keeper</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(
                                value === "none" ? undefined : parseInt(value)
                              )
                            }
                            value={field.value?.toString() || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stock keeper" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {users.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
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
                  </>
                )}
              </form>
            </Form>
          </div>
        </div>
      </Container>
    </>
  );
};

export default StockInForm;
