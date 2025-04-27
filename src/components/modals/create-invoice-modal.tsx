import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvoice } from "@/api/invoice.api";
import { CreateInvoiceRequestType } from "@/types/invoice.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { getAllStore } from "@/api/store.api";
import { getAllLaundryOrders } from "@/api/laundry_order.api";
import { StoreResponse } from "@/types/store.type";
import { LaundryOrderResponse } from "@/types/laundry_order.type";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState<CreateInvoiceRequestType>({
    id_laundry_order: "",
    id_store: "",
    date: new Date().toISOString().split("T")[0],
    total_price: 0,
    discount_price: 0,
    actual_price: 0,
    shipping_fee: 0,
    status: "Pending",
    note: "",
  });

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrderResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<LaundryOrderResponse | null>(null);

  // Fetch stores and laundry orders when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStores();
      fetchLaundryOrders();
      resetForm();
    }
  }, [isOpen]);

  // Calculate actual price when total or discount changes
  useEffect(() => {
    const total = parseFloat(formData.total_price.toString()) || 0;
    const discount =
      parseFloat(formData.discount_price?.toString() || "0") || 0;
    const shipping = parseFloat(formData.shipping_fee?.toString() || "0") || 0;

    const actual = total - discount + shipping;

    setFormData((prev) => ({
      ...prev,
      actual_price: actual,
    }));
  }, [formData.total_price, formData.discount_price, formData.shipping_fee]);

  // Update total price when laundry order changes
  useEffect(() => {
    if (selectedOrder) {
      setFormData((prev) => ({
        ...prev,
        total_price: selectedOrder.totalAmount || 0,
      }));
    }
  }, [selectedOrder]);

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load stores. Please try again.");
    }
  };

  const fetchLaundryOrders = async () => {
    try {
      const data = await getAllLaundryOrders();

      setLaundryOrders(data);
    } catch (error) {
      console.error("Error fetching laundry orders:", error);
      setError("Failed to load laundry orders. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      id_laundry_order: "",
      id_store: "",
      date: new Date().toISOString().split("T")[0],
      total_price: 0,
      discount_price: 0,
      actual_price: 0,
      shipping_fee: 0,
      status: "Pending",
      note: "",
    });
    setSelectedOrder(null);
    setError("");
    setPriceError("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "id_laundry_order") {
      const order = laundryOrders.find((o) => o._id === value);
      setSelectedOrder(order || null);

      // If the order has a store, auto-select it
      if (order && order.id_store) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          id_store: order.id_store,
        }));
        return;
      }
    }

    if (
      name === "total_price" ||
      name === "discount_price" ||
      name === "shipping_fee"
    ) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setPriceError(`${name.replace("_", " ")} must be a positive number`);
      } else {
        setPriceError("");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.id_laundry_order) {
      setError("Laundry order is required");
      return;
    }

    if (!formData.id_store) {
      setError("Store is required");
      return;
    }

    if (!formData.date) {
      setError("Date is required");
      return;
    }

    if (formData.total_price <= 0) {
      setError("Total price must be greater than zero");
      return;
    }

    if (formData.actual_price < 0) {
      setError("Actual price cannot be negative");
      return;
    }

    if (priceError) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createInvoice(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Invoice created successfully!");
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError("Failed to create invoice. Please try again.");
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo hoá đơn</DialogTitle>
            <DialogDescription>
              Create a new invoice for a completed laundry order. Fill in the
              details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_laundry_order" className="text-right">
                Đơn hàng giặt
              </Label>
              <select
                id="id_laundry_order"
                name="id_laundry_order"
                value={formData.id_laundry_order}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Chọn đơn hàng giặt</option>
                {laundryOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    id customer - {order.id_customer} -{" "}
                    {formatCurrency(order.totalAmount)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_store" className="text-right">
                Cửa hàng
              </Label>
              <select
                id="id_store"
                name="id_store"
                value={formData.id_store}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Chọn cửa hàng</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Ngày lập hóa đơn
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total_price" className="text-right">
                Tổng tiền
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="total_price"
                  name="total_price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.total_price || ""}
                  onChange={handleChange}
                  className={
                    priceError.includes("total price")
                      ? "border-destructive"
                      : ""
                  }
                  required
                />
                {priceError.includes("total price") && (
                  <p className="text-xs text-destructive">{priceError}</p>
                )}
                {formData.total_price > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.total_price)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount_price" className="text-right">
                Giảm giá
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="discount_price"
                  name="discount_price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.discount_price || ""}
                  onChange={handleChange}
                  className={
                    priceError.includes("discount") ? "border-destructive" : ""
                  }
                />
                {priceError.includes("discount") && (
                  <p className="text-xs text-destructive">{priceError}</p>
                )}
                {(formData.discount_price || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.discount_price || 0)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping_fee" className="text-right">
                Phí vận chuyển
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="shipping_fee"
                  name="shipping_fee"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.shipping_fee || ""}
                  onChange={handleChange}
                  className={
                    priceError.includes("shipping") ? "border-destructive" : ""
                  }
                />
                {priceError.includes("shipping") && (
                  <p className="text-xs text-destructive">{priceError}</p>
                )}
                {(formData.shipping_fee || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.shipping_fee || 0)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actual_price" className="text-right">
                Giá thực tế
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="actual_price"
                  name="actual_price"
                  value={formData.actual_price}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.actual_price)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng thái
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Ghi chú
              </Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note || ""}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading || !!priceError || formData.total_price <= 0}
            >
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
