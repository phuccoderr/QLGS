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
      console.error("Lỗi khi tải dữ liệu nhà cung cấp:", error);
      setError("Không thể tải dữ liệu nhà cung cấp. Vui lòng thử lại.");
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
      setError("Tên là bắt buộc");
      return;
    }

    if (!formData.id_store) {
      setError("Cửa hàng là bắt buộc");
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
      toast.success("Cập nhật nhà cung cấp thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật nhà cung cấp:", error);
      setError("Không thể cập nhật nhà cung cấp. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  // Function to get store name by ID (for displaying current store)
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Cửa hàng không xác định";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">
            Đang tải dữ liệu nhà cung cấp...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Nhà Cung Cấp</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho nhà cung cấp này. Nhấn lưu khi hoàn tất.
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
                {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
