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
      setError("Laundry order is required");
      return;
    }

    if (!formData.id_delivery_staff) {
      setError("Delivery staff is required");
      return;
    }

    if (!formData.id_store) {
      setError("Store is required");
      return;
    }

    if (!formData.delivery_address?.trim()) {
      setError("Delivery address is required");
      return;
    }

    if (!formData.phone_number?.trim()) {
      setError("Phone number is required");
      return;
    }

    // Basic email validation
    if (formData.email && !isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
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
      toast.success("Delivery record created successfully!");
    } catch (error) {
      console.error("Error creating delivery:", error);
      setError("Failed to create delivery record. Please try again.");
      setLoading(false);
    }
  };

  // Simple email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Filter out only completed laundry orders
  const completedLaundryOrders = laundryOrders.filter(
    (order) => order.status === "Completed"
  );

  // Filter only delivery staff (could be based on role or other criteria)
  const deliveryStaff = staff.filter((s) => s.status === true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Delivery</DialogTitle>
            <DialogDescription>
              Create a new delivery record for a completed laundry order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_laundry_order" className="text-right">
                Laundry Order
              </Label>
              <select
                id="id_laundry_order"
                name="id_laundry_order"
                value={formData.id_laundry_order}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a laundry order</option>
                {completedLaundryOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    #{order._id.slice(-6)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_store" className="text-right">
                Store
              </Label>
              <select
                id="id_store"
                name="id_store"
                value={formData.id_store}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_delivery_staff" className="text-right">
                Delivery Staff
              </Label>
              <select
                id="id_delivery_staff"
                name="id_delivery_staff"
                value={formData.id_delivery_staff}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select delivery staff</option>
                {deliveryStaff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery_address" className="text-right">
                Delivery Address
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
                Phone Number
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
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
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
                <option value="In Delivery">In Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
