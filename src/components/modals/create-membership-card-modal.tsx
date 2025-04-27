import { useState } from "react";
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
import { createMembershipCard } from "@/api/membership-card.api";
import { CreateMemberShipCardRequestType } from "@/types/membership-card.type";
import { toast } from "sonner";
import { getAllCustomers } from "@/api/customer.api";
import { CustomerResponse } from "@/types/customer.type";
import { useEffect } from "react";

interface CreateMembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMembershipCardModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMembershipCardModalProps) {
  const [formData, setFormData] = useState<CreateMemberShipCardRequestType>({
    id_customer: "",
    card_number: "",
    issue_date: new Date(),
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    points: 0,
    status: true,
  });

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [dateError, setDateError] = useState("");
  const [customersLoading, setCustomersLoading] = useState(false);

  // Fetch customers for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
    }
    setCustomersLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Card number validation
    if (name === "card_number") {
      if (!value) {
        setCardNumberError("Số thẻ là bắt buộc");
      } else if (!/^[A-Z0-9]{8,}$/.test(value)) {
        setCardNumberError(
          "Số thẻ phải có ít nhất 8 ký tự chữ và số (viết hoa)"
        );
      } else {
        setCardNumberError("");
      }
    }

    // Date validation
    if (name === "expiry_date") {
      const expiryDate = new Date(value);
      const issueDate = formData.issue_date;

      if (expiryDate <= issueDate) {
        setDateError("Ngày hết hạn phải sau ngày cấp");
      } else {
        setDateError("");
      }
    }

    if (name === "issue_date") {
      const issueDate = new Date(value);
      const expiryDate = formData.expiry_date;

      if (expiryDate <= issueDate) {
        setDateError("Ngày hết hạn phải sau ngày cấp");
      } else {
        setDateError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "issue_date" || name === "expiry_date"
          ? new Date(value)
          : name === "points"
          ? parseInt(value, 10)
          : name === "status"
          ? value === "true"
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (!formData.id_customer) {
      setError("Vui lòng chọn khách hàng");
      hasError = true;
    }

    if (!formData.card_number || !/^[A-Z0-9]{8,}$/.test(formData.card_number)) {
      setCardNumberError("Số thẻ phải có ít nhất 8 ký tự chữ và số (viết hoa)");
      hasError = true;
    }

    if (formData.expiry_date <= formData.issue_date) {
      setDateError("Ngày hết hạn phải sau ngày cấp");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createMembershipCard(formData);
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        id_customer: "",
        card_number: "",
        issue_date: new Date(),
        expiry_date: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ),
        points: 0,
        status: true,
      });
      toast.success("Thẻ thành viên đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating membership card:", error);
      setError("Tạo thẻ thành viên thất bại. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Thẻ Thành Viên Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho thẻ thành viên mới. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_customer" className="text-right">
                Khách Hàng
              </Label>
              <select
                id="id_customer"
                name="id_customer"
                value={formData.id_customer}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={customersLoading}
                required
              >
                <option value="">Chọn Khách Hàng</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card_number" className="text-right">
                Số Thẻ
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="card_number"
                  name="card_number"
                  value={formData.card_number}
                  onChange={handleChange}
                  className={cardNumberError ? "border-destructive" : ""}
                  placeholder="VD: CARD12345"
                  required
                />
                {cardNumberError && (
                  <p className="text-xs text-destructive">
                    {cardNumberError === "Số thẻ là bắt buộc"
                      ? "Số thẻ là bắt buộc"
                      : "Số thẻ phải có ít nhất 8 ký tự chữ và số (viết hoa)"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issue_date" className="text-right">
                Ngày Cấp
              </Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                value={formData.issue_date.toISOString().split("T")[0]}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry_date" className="text-right">
                Ngày Hết Hạn
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date.toISOString().split("T")[0]}
                  onChange={handleChange}
                  className={dateError ? "border-destructive" : ""}
                  required
                />
                {dateError && (
                  <p className="text-xs text-destructive">
                    Ngày hết hạn phải sau ngày cấp
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Điểm Ban Đầu
              </Label>
              <Input
                id="points"
                name="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Trạng Thái
              </Label>
              <select
                id="status"
                name="status"
                value={formData.status.toString()}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="true">Hoạt Động</option>
                <option value="false">Không Hoạt Động</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                loading || customersLoading || !!cardNumberError || !!dateError
              }
            >
              {loading ? "Đang Tạo..." : "Tạo Thẻ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
