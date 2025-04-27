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
import { createSupplier } from "@/api/supplier.api";
import { CreateSupplierRequestType } from "@/types/supplier.type";
import { toast } from "sonner";
import { getAllStore } from "@/api/store.api";
import { StoreResponse } from "@/types/store.type";

interface CreateSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stores: StoreResponse[];
}

export function CreateSupplierModal({
  isOpen,
  onClose,
  onSuccess,
  stores,
}: CreateSupplierModalProps) {
  const [formData, setFormData] = useState<CreateSupplierRequestType>({
    id_store: "",
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      id_store: "",
      name: "",
      phone: "",
      address: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      setError("Tên là bắt buộc");
      return;
    }

    if (!formData.id_store) {
      setError("Cửa hàng là bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createSupplier(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Nhà cung cấp đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating supplier:", error);
      setError("Không thể tạo nhà cung cấp. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Nhà Cung Cấp Mới</DialogTitle>
            <DialogDescription>
              Tạo hồ sơ nhà cung cấp mới. Điền thông tin bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_store" className="text-right">
                Cửa Hàng
              </Label>
              <select
                id="id_store"
                name="id_store"
                value={formData.id_store}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="name" className="text-right">
                Tên
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
                Điện Thoại
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Tùy chọn"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Địa Chỉ
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Tùy chọn"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang Tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
