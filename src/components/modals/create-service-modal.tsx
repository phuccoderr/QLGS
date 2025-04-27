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
import { createService } from "@/api/service.api";
import { CreateServiceRequestType } from "@/types/service.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateServiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateServiceModalProps) {
  const [formData, setFormData] = useState<CreateServiceRequestType>({
    name: "",
    price: 0,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Price validation
    if (name === "price") {
      const priceValue = parseFloat(value);
      if (isNaN(priceValue) || priceValue <= 0) {
        setPriceError("Giá phải là số dương");
      } else {
        setPriceError("");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: priceValue,
      }));
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
    if (priceError) return;

    setLoading(true);
    setError("");

    try {
      await createService(formData);
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        price: 0,
        description: "",
      });
      toast.success("Dịch vụ đã được tạo thành công!");
    } catch (error) {
      console.error("Error creating service:", error);
      setError("Không thể tạo dịch vụ. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm Dịch Vụ Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho dịch vụ mới. Nhấn lưu khi hoàn tất.
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
              <Label htmlFor="price" className="text-right">
                Giá
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className={priceError ? "border-destructive" : ""}
                  required
                />
                {priceError && (
                  <p className="text-xs text-destructive">{priceError}</p>
                )}
              </div>
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
                rows={4}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !!priceError}>
              {loading ? "Đang Lưu..." : "Lưu Dịch Vụ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
