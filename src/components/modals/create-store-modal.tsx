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
import { createStore } from "@/api/store.api";
import { CreateStoreRequestType, StoreResponse } from "@/types/store.type";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getAllCustomers } from "@/api/customer.api";
import { CustomerResponse } from "@/types/customer.type";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStoreModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStoreModalProps) {
  const [formData, setFormData] = useState<CreateStoreRequestType>({
    name: "",
    phoneNumber: "",
    address: "",
    status: true,
    id_manager: "",
  });

  const [managers, setManagers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [managersLoading, setManagersLoading] = useState(false);

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      // Reset form when modal opens
      resetForm();
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    setManagersLoading(true);
    try {
      const data = await getAllCustomers();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    }
    setManagersLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      address: "",
      status: true,
      id_manager: "",
    });
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createStore(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Store created successfully!");
    } catch (error) {
      console.error("Error creating store:", error);
      setError("Failed to create store. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Create a new store record. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_manager" className="text-right">
                Customer
              </Label>
              <select
                id="id_manager"
                name="id_manager"
                value={formData.id_manager}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={managersLoading}
              >
                <option value="">Select a customer</option>
                {managers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="status"
                  checked={!!formData.status}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="status" className="cursor-pointer">
                  {formData.status ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
