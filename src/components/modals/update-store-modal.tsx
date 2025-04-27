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
import { getStoreById, updateStore } from "@/api/store.api";
import { UpdateStoreRequestType, StoreResponse } from "@/types/store.type";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getAllCustomers } from "@/api/customer.api";
import { CustomerResponse } from "@/types/customer.type";

interface UpdateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storeId: string | null;
}

export function UpdateStoreModal({
  isOpen,
  onClose,
  onSuccess,
  storeId,
}: UpdateStoreModalProps) {
  const [formData, setFormData] = useState<UpdateStoreRequestType>({
    name: "",
    phoneNumber: "",
    address: "",
    status: true,
    id_manager: "",
  });

  const [managers, setManagers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [managersLoading, setManagersLoading] = useState(false);

  // Fetch store data and managers when modal opens and storeId changes
  useEffect(() => {
    if (isOpen) {
      fetchManagers();
      if (storeId) {
        fetchStoreData();
      }
    }
  }, [isOpen, storeId]);

  const fetchStoreData = async () => {
    if (!storeId) return;

    setFetchLoading(true);
    try {
      const storeData = await getStoreById(storeId);
      setFormData({
        name: storeData.name,
        phoneNumber: storeData.phoneNumber || "",
        address: storeData.address || "",
        status: storeData.status,
        id_manager: storeData.id_manager || "",
      });
      setFetchLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
      setError("Không thể tải dữ liệu cửa hàng. Vui lòng thử lại.");
      setFetchLoading(false);
    }
  };

  const fetchManagers = async () => {
    setManagersLoading(true);
    try {
      const data = await getAllCustomers();
      // No need to filter customers
      setManagers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
    }
    setManagersLoading(false);
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
      setError("Tên là bắt buộc");
      return;
    }

    if (!storeId) {
      setError("Thiếu mã cửa hàng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateStore(storeId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật cửa hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật cửa hàng:", error);
      setError("Không thể cập nhật cửa hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Đang tải dữ liệu cửa hàng...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Cửa Hàng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho cửa hàng này. Nhấn lưu khi hoàn tất.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="phoneNumber" className="text-right">
                  Số Điện Thoại
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  className="col-span-3"
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_manager" className="text-right">
                  Khách Hàng
                </Label>
                <select
                  id="id_manager"
                  name="id_manager"
                  value={formData.id_manager || ""}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={managersLoading}
                >
                  <option value="">Chọn khách hàng</option>
                  {managers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
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
