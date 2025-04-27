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
import { createCustomer } from "@/api/customer.api";
import { CreateCustomerRequestType } from "@/types/customer.type";
import { toast } from "sonner";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCustomerModalProps) {
  const [formData, setFormData] = useState<CreateCustomerRequestType>({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    password: "",
    birth_day: undefined,
    customer_type: "Regular",
    role: "CUSTOMER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dateError, setDateError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Password validation
    if (name === "password") {
      if (value.length < 6 && value.length > 0) {
        setPasswordError("Password must be at least 6 characters long");
      } else {
        setPasswordError("");
      }
    }

    // Date validation
    if (name === "birth_day") {
      if (!value) {
        setDateError("Birth date is required");
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

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      hasError = true;
    }

    if (!formData.birth_day) {
      setDateError("Birth date is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    setError("");
    setPasswordError("");
    setDateError("");

    try {
      await createCustomer(formData);
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        address: "",
        password: "",
        birth_day: undefined,
        customer_type: "Regular",
        role: "CUSTOMER",
      });
      toast.success("Customer created successfully!");
    } catch (error) {
      console.error("Error creating customer:", error);
      setError("Failed to create customer. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm khách hàng</DialogTitle>
            <DialogDescription>
              Enter the details for the new customer. Click save when you're
              done.
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
                Số điện thoại
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
                Địa chỉ
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
                Ngày sinh
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="birth_day"
                  name="birth_day"
                  type="date"
                  value={
                    formData.birth_day
                      ? new Date(formData.birth_day).toISOString().split("T")[0]
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
                Loại khách hàng
              </Label>
              <select
                id="customer_type"
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Regular">Thường</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  className={passwordError ? "border-destructive" : ""}
                />
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={loading || !!passwordError || !!dateError}
            >
              {loading ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
