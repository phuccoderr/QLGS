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
import {
  getMembershipCardById,
  updateMembershipCard,
  updateMembershipCardPoints,
} from "@/api/membership-card.api";
import {
  UpdateMemberShipCardRequestType,
  MemberShipCardResponse,
} from "@/types/membership-card.type";
import { toast } from "sonner";
import { getAllCustomers } from "@/api/customer.api";
import { CustomerResponse } from "@/types/customer.type";

interface UpdateMembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cardId: string | null;
}

export function UpdateMembershipCardModal({
  isOpen,
  onClose,
  onSuccess,
  cardId,
}: UpdateMembershipCardModalProps) {
  const [formData, setFormData] = useState<UpdateMemberShipCardRequestType>({
    id_customer: "",
    card_number: "",
    issue_date: undefined,
    expiry_date: undefined,
    points: undefined,
    status: undefined,
  });

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [dateError, setDateError] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  // Fetch customers and card data when modal opens and cardId changes
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      if (cardId) {
        fetchCardData();
      }
    }
  }, [isOpen, cardId]);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại.");
    }
  };

  const fetchCardData = async () => {
    if (!cardId) return;

    setFetchLoading(true);
    try {
      const cardData = await getMembershipCardById(cardId);
      setFormData({
        id_customer: cardData.id_customer,
        card_number: cardData.card_number,
        issue_date: new Date(cardData.issue_date),
        expiry_date: new Date(cardData.expiry_date),
        points: cardData.points,
        status: cardData.status,
      });
      setFetchLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải thẻ thành viên:", error);
      setError("Không thể tải dữ liệu thẻ thành viên. Vui lòng thử lại.");
      setFetchLoading(false);
    }
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
    if (name === "expiry_date" && formData.issue_date) {
      const expiryDate = new Date(value);

      if (expiryDate <= formData.issue_date) {
        setDateError("Ngày hết hạn phải sau ngày cấp");
      } else {
        setDateError("");
      }
    }

    if (name === "issue_date" && formData.expiry_date) {
      const issueDate = new Date(value);

      if (formData.expiry_date <= issueDate) {
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

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointsToAdd(parseInt(e.target.value, 10) || 0);
  };

  const handleAddPoints = async () => {
    if (!cardId) return;
    if (pointsToAdd === 0) return;

    setLoading(true);
    try {
      const updatedCard = await updateMembershipCardPoints(cardId, pointsToAdd);
      setFormData((prev) => ({
        ...prev,
        points: updatedCard.points,
      }));
      setPointsToAdd(0);
      toast.success(
        `${Math.abs(pointsToAdd)} điểm đã được ${
          pointsToAdd > 0 ? "thêm vào" : "trừ từ"
        } thẻ`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật điểm:", error);
      setError("Cập nhật điểm thất bại. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (formData.card_number && !/^[A-Z0-9]{8,}$/.test(formData.card_number)) {
      setCardNumberError("Số thẻ phải có ít nhất 8 ký tự chữ và số (viết hoa)");
      hasError = true;
    }

    if (
      formData.expiry_date &&
      formData.issue_date &&
      formData.expiry_date <= formData.issue_date
    ) {
      setDateError("Ngày hết hạn phải sau ngày cấp");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!cardId) {
      setError("Thiếu ID thẻ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateMembershipCard(cardId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật thẻ thành viên thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thẻ thành viên:", error);
      setError("Cập nhật thẻ thành viên thất bại. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">
            Đang tải dữ liệu thẻ thành viên...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Thẻ Thành Viên</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho thẻ thành viên này. Nhấn lưu khi hoàn
                tất.
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
                  value={formData.issue_date?.toISOString().split("T")[0] || ""}
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
                    value={
                      formData.expiry_date?.toISOString().split("T")[0] || ""
                    }
                    onChange={handleChange}
                    className={dateError ? "border-destructive" : ""}
                    required
                  />
                  {dateError && (
                    <p className="text-xs text-destructive">
                      {"Ngày hết hạn phải sau ngày cấp"}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  Điểm
                </Label>
                <div className="col-span-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">
                      Hiện tại: <strong>{formData.points}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={pointsToAdd}
                      onChange={handlePointsChange}
                      placeholder="Điểm thêm/trừ"
                      className="w-full"
                    />
                    <Button
                      type="button"
                      onClick={handleAddPoints}
                      disabled={loading || pointsToAdd === 0}
                      size="sm"
                    >
                      {pointsToAdd >= 0 ? "Thêm" : "Trừ"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Nhập giá trị âm để trừ điểm)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Trạng Thái
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status?.toString()}
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
                disabled={loading || !!cardNumberError || !!dateError}
              >
                {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
