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
import { getCustomerById, updateCustomer } from "@/api/customer.api";
import {
  UpdateCustomerRequestType,
  CustomerResponse,
} from "@/types/customer.type";
import { toast } from "sonner";

interface UpdateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string | null;
}

export function UpdateCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  customerId,
}: UpdateCustomerModalProps) {
  const [formData, setFormData] = useState<UpdateCustomerRequestType>({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    birth_day: undefined,
    customer_type: "Regular",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState("");

  // Fetch customer data when modal opens and customerId changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !isOpen) return;

      setFetchLoading(true);
      try {
        const customerData = await getCustomerById(customerId);
        setFormData({
          name: customerData.name,
          phoneNumber: customerData.phoneNumber,
          email: customerData.email,
          address: customerData.address || "",
          birth_day: customerData.birth_day
            ? new Date(customerData.birth_day)
            : undefined,
          customer_type: customerData.customer_type,
        });
        setFetchLoading(false);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Không thể tải dữ liệu khách hàng. Vui lòng thử lại.");
        setFetchLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Date validation
    if (name === "birth_day") {
      if (!value) {
        setDateError("Ngày sinh là bắt buộc");
      } else {
        setDateError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "birth_day" ? (value ? new Date(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (!formData.birth_day) {
      setDateError("Ngày sinh là bắt buộc");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!customerId) {
      setError("Thiếu mã khách hàng");
      return;
    }

    setLoading(true);
    setError("");
    setDateError("");

    try {
      await updateCustomer(customerId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật khách hàng thành công");
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Không thể cập nhật khách hàng. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Đang tải dữ liệu khách hàng...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Khách Hàng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho khách hàng này. Nhấn lưu khi hoàn tất.
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
                <Label htmlFor="email" className="text-right">
                  Email
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
                  Điện Thoại
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
                <Label htmlFor="address" className="text-right">
                  Địa Chỉ
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birth_day" className="text-right">
                  Ngày Sinh
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="birth_day"
                    name="birth_day"
                    type="date"
                    value={
                      formData.birth_day
                        ? new Date(formData.birth_day)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className={dateError ? "border-destructive" : ""}
                    required
                  />
                  {dateError && (
                    <p className="text-xs text-destructive">{dateError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer_type" className="text-right">
                  Loại Khách Hàng
                </Label>
                <select
                  id="customer_type"
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Regular">Thường</option>
                  <option value="Premium">Cao Cấp</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading || !!dateError}>
                {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
