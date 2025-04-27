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
import { createPromotion } from "@/api/promotion.api";
import { CreatePromotionRequestType } from "@/types/promotion.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePromotionModalProps) {
  const [formData, setFormData] = useState<CreatePromotionRequestType>({
    name: "",
    description: "",
    type: "Percentage",
    value: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [valueError, setValueError] = useState("");
  const [dateError, setDateError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "value") {
      const valueNum = parseFloat(value);
      if (isNaN(valueNum) || valueNum <= 0) {
        setValueError("Giá trị phải là số dương");
      } else if (formData.type === "Percentage" && valueNum > 100) {
        setValueError("Phần trăm không thể lớn hơn 100%");
      } else {
        setValueError("");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: valueNum,
      }));
    } else if (name === "type") {
      // Reset value error when type changes
      if (value === "Percentage" && formData.value > 100) {
        setValueError("Phần trăm không thể lớn hơn 100%");
      } else {
        setValueError("");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value as "Percentage" | "Cash",
      }));
    } else if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else if (name === "startDate" || name === "endDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate dates
      if (name === "endDate" && formData.startDate && value) {
        if (new Date(value) <= new Date(formData.startDate)) {
          setDateError("Ngày kết thúc phải sau ngày bắt đầu");
        } else {
          setDateError("");
        }
      } else if (name === "startDate" && formData.endDate && value) {
        if (new Date(formData.endDate) <= new Date(value)) {
          setDateError("Ngày kết thúc phải sau ngày bắt đầu");
        } else {
          setDateError("");
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    if (valueError) return;
    if (dateError) return;

    // Check if end date is provided
    if (!formData.endDate) {
      setDateError("Ngày kết thúc là bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createPromotion(formData);
      toast.success("Khuyến mãi đã được tạo thành công!");
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "Percentage",
        value: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        status: true,
      });
    } catch (error) {
      console.error("Error creating promotion:", error);
      setError("Không thể tạo khuyến mãi. Vui lòng thử lại.");
      toast.error("Tạo khuyến mãi thất bại");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Khuyến Mãi Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho khuyến mãi mới. Nhấn lưu khi hoàn tất.
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
              <Label htmlFor="description" className="text-right">
                Mô Tả
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Loại
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Percentage">Phần Trăm</option>
                <option value="Cash">Tiền Mặt</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Giá Trị
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={formData.type === "Percentage" ? "100" : undefined}
                  value={formData.value || ""}
                  onChange={handleChange}
                  className={valueError ? "border-destructive" : ""}
                  required
                />
                {valueError && (
                  <p className="text-xs text-destructive">{valueError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Ngày Bắt Đầu
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Ngày Kết Thúc
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
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
              disabled={loading || !!valueError || !!dateError}
            >
              {loading ? "Đang Lưu..." : "Lưu Khuyến Mãi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
