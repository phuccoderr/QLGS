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
import { createDelivery } from "@/api/delivery.api";
import { CreateDeliveryRequestType } from "@/types/delivery.type";
import { toast } from "sonner";
import { StoreResponse } from "@/types/store.type";
import { StaffResponse } from "@/types/staff.type";
import { LaundryOrderResponse } from "@/types/laundry_order.type";

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  laundryOrders: LaundryOrderResponse[];
  stores: StoreResponse[];
  staff: StaffResponse[];
}

export function CreateDeliveryModal({
  isOpen,
  onClose,
  onSuccess,
  laundryOrders,
  stores,
  staff,
}: CreateDeliveryModalProps) {
  const [formData, setFormData] = useState<CreateDeliveryRequestType>({
    id_laundry_order: "",
    id_delivery_staff: "",
    id_store: "",
    delivery_address: "",
    phone_number: "",
    email: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<LaundryOrderResponse | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Auto-populate customer details when laundry order is selected
  useEffect(() => {
    if (selectedOrder) {
      // Find the customer associated with the order
      const orderWithCustomer = laundryOrders.find(
        (order) => order._id === selectedOrder._id
      );

      if (orderWithCustomer) {
        setFormData((prev) => ({
          ...prev,
          id_store: orderWithCustomer.id_store || prev.id_store,
        }));
      }
    }
  }, [selectedOrder, laundryOrders]);

  const resetForm = () => {
    setFormData({
      id_laundry_order: "",
      id_delivery_staff: "",
      id_store: "",
      delivery_address: "",
      phone_number: "",
      email: "",
      status: "Pending",
    });
    setSelectedOrder(null);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "id_laundry_order") {
      const order = laundryOrders.find((o) => o._id === value);
      setSelectedOrder(order || null);
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
      setError("Đơn hàng giặt là bắt buộc");
      return;
    }

    if (!formData.id_delivery_staff) {
      setError("Nhân viên giao hàng là bắt buộc");
      return;
    }

    if (!formData.id_store) {
      setError("Cửa hàng là bắt buộc");
      return;
    }

    if (!formData.delivery_address?.trim()) {
      setError("Địa chỉ giao hàng là bắt buộc");
      return;
    }

    if (!formData.phone_number?.trim()) {
      setError("Số điện thoại là bắt buộc");
      return;
    }

    // Basic email validation
    if (formData.email && !isValidEmail(formData.email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createDelivery(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Tạo đơn giao hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo đơn giao hàng:", error);
      setError("Không thể tạo đơn giao hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  // Simple email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Filter only delivery staff (could be based on role or other criteria)
  const deliveryStaff = staff.filter((s) => s.status === true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm giao hàng</DialogTitle>
            <DialogDescription>
              Tạo đơn giao hàng mới cho đơn hàng giặt đã hoàn thành.
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
                    #{order._id}
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
              <Label htmlFor="id_delivery_staff" className="text-right">
                Nhân viên giao hàng
              </Label>
              <select
                id="id_delivery_staff"
                name="id_delivery_staff"
                value={formData.id_delivery_staff}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Chọn nhân viên giao hàng</option>
                {deliveryStaff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery_address" className="text-right">
                Địa chỉ giao hàng
              </Label>
              <Input
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Tùy chọn"
              />
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
                <option value="Pending">Đang xử lý</option>
                <option value="In Delivery">Đang giao</option>
                <option value="Delivered">Đã giao</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo đơn giao hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
