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
import { getGoodsById, updateGoods } from "@/api/goods.api";
import { UpdateGoodsRequestType, GoodsResponse } from "@/types/goods.type";
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

interface UpdateGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goodsId: string | null;
}

export function UpdateGoodsModal({
  isOpen,
  onClose,
  onSuccess,
  goodsId,
}: UpdateGoodsModalProps) {
  const [formData, setFormData] = useState<UpdateGoodsRequestType>({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    unit: "",
    status: true,
  });

  const [originalData, setOriginalData] = useState<GoodsResponse | null>(null);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [storesLoading, setStoresLoading] = useState(false);

  // Category options
  const categoryOptions = [
    "Thực phẩm",
    "Đồ uống",
    "Điện tử",
    "Quần áo",
    "Mỹ phẩm",
    "Đồ gia dụng",
    "Khác",
  ];

  // Unit options
  const unitOptions = ["cái", "kg", "lít", "hộp", "gói", "bộ"];

  // Fetch goods data and stores when modal opens and goodsId changes
  useEffect(() => {
    if (isOpen && goodsId) {
      fetchGoodsData();
      fetchStores();
    }
  }, [isOpen, goodsId]);

  const fetchGoodsData = async () => {
    if (!goodsId) return;

    setFetchLoading(true);
    try {
      const goodsData = await getGoodsById(goodsId);
      setOriginalData(goodsData);

      // Set form data
      setFormData({
        name: goodsData.name || "",
        category: goodsData.category || "",
        quantity: goodsData.quantity || 0,
        price: goodsData.price || 0,
        unit: goodsData.unit || "",
        id_store: goodsData.id_store || "",
        status: goodsData.status,
        expiryDate: goodsData.expiryDate
          ? new Date(goodsData.expiryDate)
          : undefined,
      });

      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching goods data:", error);
      setError("Không thể tải dữ liệu hàng hóa. Vui lòng thử lại.");
      setFetchLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Không thể tải danh sách cửa hàng. Vui lòng thử lại.");
    }
    setStoresLoading(false);
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

    // Validate required fields if they're being updated
    if (formData.name !== undefined && !formData.name.trim()) {
      setError("Tên là bắt buộc");
      return;
    }

    if (formData.category !== undefined && !formData.category.trim()) {
      setError("Danh mục là bắt buộc");
      return;
    }

    if (formData.quantity !== undefined && formData.quantity <= 0) {
      setError("Số lượng phải lớn hơn không");
      return;
    }

    if (formData.price !== undefined && formData.price <= 0) {
      setError("Giá tiền phải lớn hơn không");
      return;
    }

    if (formData.unit !== undefined && !formData.unit.trim()) {
      setError("Đơn vị là bắt buộc");
      return;
    }

    if (!goodsId) {
      setError("Thiếu mã hàng hóa");
      return;
    }

    setLoading(true);
    setError("");

    // Create update data object
    const updateData: UpdateGoodsRequestType = { ...formData };

    try {
      await updateGoods(goodsId, updateData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật hàng hóa thành công!");
    } catch (error) {
      console.error("Error updating goods:", error);
      setError("Không thể cập nhật hàng hóa. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Đang tải dữ liệu hàng hóa...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Hàng Hóa</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho mặt hàng này. Các trường có dấu * là bắt
                buộc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên *
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
                  Danh Mục *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Chọn danh mục" />
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
                  Số Lượng *
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
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Giá Tiền *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price?.toString() || "0"}
                  onChange={handleChange}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Đơn Vị *
                </Label>
                <Select
                  value={formData.unit || ""}
                  onValueChange={(value) => handleSelectChange("unit", value)}
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Chọn đơn vị" />
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
                  Ngày Hết Hạn
                </Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={
                    formData.expiryDate
                      ? new Date(formData.expiryDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_store" className="text-right">
                  Cửa Hàng
                </Label>
                <Select
                  value={formData.id_store || ""}
                  onValueChange={(value) =>
                    handleSelectChange("id_store", value)
                  }
                  disabled={storesLoading}
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Chọn cửa hàng (tùy chọn)" />
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
                {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
