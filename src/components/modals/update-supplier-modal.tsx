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
import { getSupplierById, updateSupplier } from "@/api/supplier.api";
import {
  UpdateSupplierRequestType,
  SupplierResponse,
} from "@/types/supplier.type";
import { toast } from "sonner";
import { StoreResponse } from "@/types/store.type";

interface UpdateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierId: string;
  stores: StoreResponse[];
}

export function UpdateSupplierModal({
  isOpen,
  onClose,
  onSuccess,
  supplierId,
  stores,
}: UpdateSupplierModalProps) {
  const [formData, setFormData] = useState<UpdateSupplierRequestType>({
    id_store: "",
    name: "",
    phone: "",
    address: "",
  });

  const [originalData, setOriginalData] = useState<SupplierResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch supplier data when modal opens and supplierId changes
  useEffect(() => {
    if (isOpen && supplierId) {
      fetchSupplierData();
    }
  }, [isOpen, supplierId]);

  const fetchSupplierData = async () => {
    if (!supplierId) return;

    setFetchLoading(true);
    setError("");

    try {
      const data = await getSupplierById(supplierId);
      setOriginalData(data);
      setFormData({
        id_store: data.id_store,
        name: data.name,
        phone: data.phone || "",
        address: data.address || "",
      });
      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      setError("Failed to load supplier data. Please try again.");
      setFetchLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.id_store) {
      setError("Store is required");
      return;
    }

    // Check if anything has changed
    const hasChanges =
      formData.id_store !== originalData?.id_store ||
      formData.name !== originalData?.name ||
      formData.phone !== originalData?.phone ||
      formData.address !== originalData?.address;

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateSupplier(supplierId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Supplier updated successfully!");
    } catch (error) {
      console.error("Error updating supplier:", error);
      setError("Failed to update supplier. Please try again.");
      setLoading(false);
    }
  };

  // Function to get store name by ID (for displaying current store)
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Unknown Store";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Loading supplier data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Supplier</DialogTitle>
              <DialogDescription>
                Update the details for this supplier. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_store" className="text-right">
                  Store
                </Label>
                <select
                  id="id_store"
                  name="id_store"
                  value={formData.id_store}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
