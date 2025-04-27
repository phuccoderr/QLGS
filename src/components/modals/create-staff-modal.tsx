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
import { createStaff } from "@/api/staff.api";
import { CreateStaffRequestType } from "@/types/staff.type";
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

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStaffModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStaffModalProps) {
  const [formData, setFormData] = useState<CreateStaffRequestType>({
    id_store: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: "STAFF",
    password: "",
    status: true,
  });

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);

  // Available role options
  const roleOptions = ["STAFF", "ADMIN", "CUSTOMER"];

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
      setError("Không thể tải danh sách cửa hàng. Vui lòng thử lại.");
    }
    setStoresLoading(false);
  };

  const resetForm = () => {
    setFormData({
      id_store: "",
      name: "",
      phoneNumber: "",
      email: "",
      role: "STAFF",
      password: "",
      status: true,
    });
    setError("");
    setPasswordVisible(false);
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

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      setError("Tên là bắt buộc");
      return;
    }

    if (!formData.id_store?.trim()) {
      setError("Cửa hàng là bắt buộc");
      return;
    }

    if (!formData.email?.trim()) {
      setError("Email là bắt buộc");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    if (!formData.phoneNumber?.trim()) {
      setError("Số điện thoại là bắt buộc");
      return;
    }

    if (!formData.password?.trim()) {
      setError("Mật khẩu là bắt buộc");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert boolean status to string before submission
      const submitData = {
        ...formData,
        status: String(formData.status) as any,
      };

      await createStaff(submitData);
      setLoading(false);
      resetForm();
      onSuccess();
      onClose();
      toast.success("Nhân viên đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating staff member:", error);
      setError("Không thể tạo nhân viên. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
            <DialogDescription>
              Tạo hồ sơ nhân viên mới. Các trường đánh dấu * là bắt buộc.
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
              <Label htmlFor="id_store" className="text-right">
                Cửa Hàng *
              </Label>
              <Select
                value={formData.id_store}
                onValueChange={(value) => handleSelectChange("id_store", value)}
                disabled={storesLoading}
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
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Điện Thoại *
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Vai Trò
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  handleSelectChange("role", value as "STAFF" | "MANAGER")
                }
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật Khẩu *
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? "Ẩn" : "Hiện"}
                </Button>
              </div>
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
              {loading ? "Đang Tạo..." : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
