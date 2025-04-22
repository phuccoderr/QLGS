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
        setError("Failed to load customer data. Please try again.");
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

    if (!formData.birth_day) {
      setDateError("Birth date is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!customerId) {
      setError("Customer ID is missing");
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
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Failed to update customer. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Loading customer data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Customer</DialogTitle>
              <DialogDescription>
                Update the details for this customer. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
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
                  Phone
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
                  Address
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
                  Birth Date
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
                  Customer Type
                </Label>
                <select
                  id="customer_type"
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Regular">Regular</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !!dateError}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
