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
import { getWarehouseById, updateWarehouse } from "@/api/warehouse.api";
import {
  UpdateWarehouseRequestType,
  WarehouseResponse,
} from "@/types/warehouse.type";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { GoodsResponse } from "@/types/goods.type";
import { StoreResponse } from "@/types/store.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouseId: string;
  goods: GoodsResponse[];
  stores: StoreResponse[];
}

export function UpdateWarehouseModal({
  isOpen,
  onClose,
  onSuccess,
  warehouseId,
  goods,
  stores,
}: UpdateWarehouseModalProps) {
  const [formData, setFormData] = useState<UpdateWarehouseRequestType>({
    id_store: "",
    id_goods: "",
    quantity: 0,
    status: true,
  });

  const [originalData, setOriginalData] = useState<WarehouseResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Fetch warehouse data when modal opens
  useEffect(() => {
    if (isOpen && warehouseId) {
      fetchWarehouseData();
    }
  }, [isOpen, warehouseId]);

  const fetchWarehouseData = async () => {
    setFetchLoading(true);
    setError("");

    try {
      const data = await getWarehouseById(warehouseId);
      setOriginalData(data);
      setFormData({
        id_store: data.id_store,
        id_goods: data.id_goods,
        quantity: data.quantity,
        status: data.status,
      });
      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
      setError("Failed to load warehouse data. Please try again.");
      setFetchLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
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

    // Validate quantity if it's being updated
    if (formData.quantity !== undefined && formData.quantity < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    // Check if anything has changed
    const hasChanges =
      formData.id_store !== originalData?.id_store ||
      formData.id_goods !== originalData?.id_goods ||
      formData.quantity !== originalData?.quantity ||
      formData.status !== originalData?.status;

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateWarehouse(warehouseId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Warehouse record updated successfully!");
    } catch (error) {
      console.error("Error updating warehouse record:", error);
      setError("Failed to update warehouse record. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="flex items-center justify-center py-6">
            <p>Loading warehouse data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Warehouse Record</DialogTitle>
              <DialogDescription>
                Update the warehouse inventory record. Leave fields unchanged if
                you don't want to update them.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_store" className="text-right">
                  Store
                </Label>
                <Select
                  value={formData.id_store}
                  onValueChange={(value) =>
                    handleSelectChange("id_store", value)
                  }
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store._id} value={store._id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_goods" className="text-right">
                  Goods
                </Label>
                <Select
                  value={formData.id_goods}
                  onValueChange={(value) =>
                    handleSelectChange("id_goods", value)
                  }
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Select a goods item" />
                  </SelectTrigger>
                  <SelectContent>
                    {goods.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity?.toString() || "0"}
                  onChange={handleChange}
                  className="col-span-3"
                  min="0"
                  step="1"
                />
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
                {loading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
