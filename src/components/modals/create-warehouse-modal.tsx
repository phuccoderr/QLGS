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
import { createWarehouse } from "@/api/warehouse.api";
import { CreateWarehouseRequestType } from "@/types/warehouse.type";
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

interface CreateWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goods: GoodsResponse[];
  stores: StoreResponse[];
}

export function CreateWarehouseModal({
  isOpen,
  onClose,
  onSuccess,
  goods,
  stores,
}: CreateWarehouseModalProps) {
  const [formData, setFormData] = useState<CreateWarehouseRequestType>({
    id_store: "",
    id_goods: "",
    quantity: 0,
    status: true,
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
      id_goods: "",
      quantity: 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.id_store) {
      setError("Cửa hàng là bắt buộc");
      return;
    }

    if (!formData.id_goods) {
      setError("Hàng hóa là bắt buộc");
      return;
    }

    if (formData.quantity < 0) {
      setError("Số lượng không thể âm");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createWarehouse(formData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Kho hàng đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating warehouse record:", error);
      setError("Không thể tạo kho hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  // Helper to check if a store or goods item is already in use
  const isStoreGoodsCombinationExists = (storeId: string, goodsId: string) => {
    // This would check if a store-goods combination already exists in the warehouse
    // For implementation, you'd need to either check against loaded warehouse data or add a backend endpoint
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Kho Hàng Mới</DialogTitle>
            <DialogDescription>
              Tạo bản ghi kho hàng mới. Các trường có dấu * là bắt buộc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_store" className="text-right">
                Cửa Hàng *
              </Label>
              <Select
                value={formData.id_store}
                onValueChange={(value) => handleSelectChange("id_store", value)}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Chọn cửa hàng" />
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
                Hàng Hóa *
              </Label>
              <Select
                value={formData.id_goods}
                onValueChange={(value) => handleSelectChange("id_goods", value)}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Chọn mặt hàng" />
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
                Số Lượng *
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
              <Label htmlFor="status" className="text-right">
                Trạng Thái
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="status"
                  checked={!!formData.status}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="status" className="cursor-pointer">
                  {formData.status ? "Hoạt Động" : "Không Hoạt Động"}
                </Label>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          {formData.id_store &&
            formData.id_goods &&
            isStoreGoodsCombinationExists(
              formData.id_store,
              formData.id_goods
            ) && (
              <p className="text-sm text-amber-500 mb-4">
                Cảnh báo: Cửa hàng này đã có mặt hàng này trong kho. Việc tạo
                mới sẽ dẫn đến bản ghi trùng lặp.
              </p>
            )}
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
