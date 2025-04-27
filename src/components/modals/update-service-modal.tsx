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
import { getServiceById, updateService } from "@/api/service.api";
import {
  UpdateServiceRequestType,
  ServiceResponse,
} from "@/types/service.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UpdateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceId: string | null;
}

export function UpdateServiceModal({
  isOpen,
  onClose,
  onSuccess,
  serviceId,
}: UpdateServiceModalProps) {
  const [formData, setFormData] = useState<UpdateServiceRequestType>({
    name: "",
    price: 0,
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceError, setPriceError] = useState("");

  // Fetch service data when modal opens and serviceId changes
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId || !isOpen) return;

      setFetchLoading(true);
      try {
        const serviceData = await getServiceById(serviceId);
        setFormData({
          name: serviceData.name,
          price: serviceData.price,
          description: serviceData.description || "",
        });
        setFetchLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dịch vụ:", error);
        setError("Không thể tải dữ liệu dịch vụ. Vui lòng thử lại.");
        setFetchLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Price validation
    if (name === "price") {
      const priceValue = parseFloat(value);
      if (isNaN(priceValue) || priceValue <= 0) {
        setPriceError("Giá tiền phải là số dương");
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

    if (!serviceId) {
      setError("Thiếu mã dịch vụ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateService(serviceId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật dịch vụ thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      setError("Không thể cập nhật dịch vụ. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Đang tải dữ liệu dịch vụ...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Dịch Vụ</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho dịch vụ này. Nhấn lưu khi hoàn tất.
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
                  Giá Tiền
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
                {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
