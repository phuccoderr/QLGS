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
import { createGoods } from "@/api/goods.api";
import { CreateGoodsRequestType } from "@/types/goods.type";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getAllStore } from "@/api/store.api";
import { StoreResponse } from "@/types/store.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGoodsModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGoodsModalProps) {
  const [formData, setFormData] = useState<CreateGoodsRequestType>({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    unit: "",
    status: true,
  });

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [storesLoading, setStoresLoading] = useState(false);

  // Category options
  const categoryOptions = [
    "Food",
    "Beverage",
    "Electronics",
    "Clothing",
    "Cosmetics",
    "Household",
    "Other",
  ];

  // Unit options
  const unitOptions = ["piece", "kg", "liter", "box", "pack", "set"];

  // Fetch stores when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStores();
      resetForm();
    }
  }, [isOpen]);

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load stores. Please try again.");
    }
    setStoresLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      unit: "",
      status: true,
    });
    setError("");
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

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      expiryDate: date ? new Date(date) : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.category?.trim()) {
      setError("Category is required");
      return;
    }

    if (formData.quantity <= 0) {
      setError("Quantity must be greater than zero");
      return;
    }

    if (formData.price <= 0) {
      setError("Price must be greater than zero");
      return;
    }

    if (!formData.unit?.trim()) {
      setError("Unit is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createGoods(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Goods created successfully!");
    } catch (error) {
      console.error("Error creating goods:", error);
      setError("Failed to create goods. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Goods</DialogTitle>
            <DialogDescription>
              Create a new goods item. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
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
              <Label htmlFor="category" className="text-right">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity *
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity.toString()}
                onChange={handleChange}
                className="col-span-3"
                min="0"
                step="1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price.toString()}
                onChange={handleChange}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleSelectChange("unit", value)}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={
                  formData.expiryDate
                    ? new Date(formData.expiryDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleDateChange(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_store" className="text-right">
                Store
              </Label>
              <Select
                value={formData.id_store || ""}
                onValueChange={(value) => handleSelectChange("id_store", value)}
                disabled={storesLoading}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select a store (optional)" />
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
