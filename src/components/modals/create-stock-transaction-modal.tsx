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
import { CreateStockTransactionRequestType } from "@/types/stock-transaction.type";
import { toast } from "sonner";
import { getAllGoods } from "@/api/goods.api";
import { getAllStore } from "@/api/store.api";
import { getAllSuppliers } from "@/api/supplier.api";
import { createStockTransaction } from "@/api/stock-transaction.api";

interface CreateStockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStockTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStockTransactionModalProps) {
  const [formData, setFormData] = useState<CreateStockTransactionRequestType>({
    id_goods: "",
    id_store: "",
    id_supplier: "",
    type: "Nhap",
    quantity: 1,
    price: 0,
    date: new Date(),
  });

  const [goods, setGoods] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch reference data for dropdowns
  useEffect(() => {
    if (isOpen) {
      fetchReferenceData();
    }
  }, [isOpen]);

  const fetchReferenceData = async () => {
    setDataLoading(true);
    try {
      const [goodsData, storesData, suppliersData] = await Promise.all([
        getAllGoods(),
        getAllStore(),
        getAllSuppliers(),
      ]);
      setGoods(goodsData);
      setStores(storesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error fetching reference data:", error);
      setError("Failed to load reference data. Please try again.");
    }
    setDataLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : name === "date"
          ? new Date(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (!formData.id_goods) {
      setError("Please select a goods item");
      hasError = true;
    } else if (!formData.id_store) {
      setError("Please select a store");
      hasError = true;
    } else if (formData.type === "Nhap" && !formData.id_supplier) {
      setError("Please select a supplier for incoming transactions");
      hasError = true;
    } else if (formData.quantity <= 0) {
      setError("Quantity must be greater than 0");
      hasError = true;
    } else if (formData.price < 0) {
      setError("Price cannot be negative");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create a new object to send to API
      const dataToSubmit = { ...formData };

      // If type is "Xuat" (outgoing) and supplier is empty, remove it
      if (formData.type === "Xuat" && formData.id_supplier === "") {
        delete dataToSubmit.id_supplier;
      }

      await createStockTransaction(dataToSubmit);
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        id_goods: "",
        id_store: "",
        id_supplier: "",
        type: "Nhap",
        quantity: 1,
        price: 0,
        date: new Date(),
      });
      toast.success("Stock transaction created successfully!");
    } catch (error) {
      console.error("Error creating stock transaction:", error);
      setError("Failed to create stock transaction. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Stock Transaction</DialogTitle>
            <DialogDescription>
              Enter the details for the new stock transaction. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Transaction Type
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Nhap">Incoming (Nhap)</option>
                <option value="Xuat">Outgoing (Xuat)</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_goods" className="text-right">
                Goods
              </Label>
              <select
                id="id_goods"
                name="id_goods"
                value={formData.id_goods}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={dataLoading}
                required
              >
                <option value="">Select Goods</option>
                {goods.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
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
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={dataLoading}
                required
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {(formData.type === "Nhap" || formData.id_supplier) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_supplier" className="text-right">
                  Supplier
                </Label>
                <select
                  id="id_supplier"
                  name="id_supplier"
                  value={formData.id_supplier}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={dataLoading}
                  required={formData.type === "Nhap"}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Transaction Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
