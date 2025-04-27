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
      console.error("Lỗi khi tải dữ liệu kho hàng:", error);
      setError("Không thể tải dữ liệu kho hàng. Vui lòng thử lại.");
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
      setError("Số lượng không thể âm");
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
      toast.success("Cập nhật kho hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật kho hàng:", error);
      setError("Không thể cập nhật kho hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="flex items-center justify-center py-6">
            <p>Đang tải dữ liệu kho hàng...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Kho Hàng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin kho hàng. Giữ nguyên các trường nếu bạn không
                muốn cập nhật chúng.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_store" className="text-right">
                  Cửa Hàng
                </Label>
                <Select
                  value={formData.id_store}
                  onValueChange={(value) =>
                    handleSelectChange("id_store", value)
                  }
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
                  Hàng Hóa
                </Label>
                <Select
                  value={formData.id_goods}
                  onValueChange={(value) =>
                    handleSelectChange("id_goods", value)
                  }
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
                  Số Lượng
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang Cập Nhật..." : "Cập Nhật"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
