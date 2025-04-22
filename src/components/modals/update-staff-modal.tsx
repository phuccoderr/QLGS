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
import { getStaffById, updateStaff, updateStaffRole } from "@/api/staff.api";
import { UpdateStaffRequestType, StaffResponse } from "@/types/staff.type";
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

interface UpdateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staffId: string | null;
}

export function UpdateStaffModal({
  isOpen,
  onClose,
  onSuccess,
  staffId,
}: UpdateStaffModalProps) {
  const [formData, setFormData] = useState<
    UpdateStaffRequestType & { role: "MANAGER" | "STAFF" }
  >({
    id_store: "",
    name: "",
    phoneNumber: "",
    email: "",
    role: "STAFF",
    password: "",
    status: true,
  });

  const [originalData, setOriginalData] = useState<StaffResponse | null>(null);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [storesLoading, setStoresLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Available role options
  const roleOptions = ["STAFF", "MANAGER"];

  // Fetch staff data and stores when modal opens and staffId changes
  useEffect(() => {
    if (isOpen && staffId) {
      fetchStaffData();
      fetchStores();
    }
  }, [isOpen, staffId]);

  const fetchStaffData = async () => {
    if (!staffId) return;

    setFetchLoading(true);
    try {
      const staffData = await getStaffById(staffId);
      setOriginalData(staffData);

      // Set form data without password
      setFormData({
        id_store: staffData.id_store || "",
        name: staffData.name || "",
        phoneNumber: staffData.phoneNumber || "",
        email: staffData.email || "",
        role: staffData.role || "STAFF",
        status: staffData.status,
        // Don't set password - it will be optional for update
      });

      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      setError("Failed to load staff data. Please try again.");
      setFetchLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to load stores. Please try again.");
    }
    setStoresLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear validation errors when fields are being edited
    if (name === "password") {
      if (value.length >= 6 || value.length === 0) {
        setPasswordError("");
      } else {
        setPasswordError("Password must be at least 6 characters long");
      }

      // Track if password has been modified
      if (value.length > 0) {
        setIsPasswordDirty(true);
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setError("Name is required");
      return;
    }

    if (!formData.id_store?.trim()) {
      setError("Store is required");
      return;
    }

    if (!formData.email?.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.phoneNumber?.trim()) {
      setError("Phone number is required");
      return;
    }

    // Validate password only if it's been changed
    if (isPasswordDirty && formData.password && formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (!staffId) {
      setError("Staff ID is missing");
      return;
    }

    setLoading(true);
    setError("");
    setPasswordError("");

    // Remove password if it wasn't changed
    const updateData: UpdateStaffRequestType = { ...formData };
    if (!isPasswordDirty || !updateData.password) {
      delete updateData.password;
    }

    // Remove role from update data as it's not part of UpdateStaffRequestType
    const roleValue = formData.role;
    delete (updateData as any).role;

    // Convert boolean status to string
    updateData.status = String(updateData.status) as any;

    try {
      // Check if role has changed, if so use the specialized endpoint
      if (originalData && originalData.role !== roleValue) {
        await updateStaffRole(staffId, roleValue);
      }

      await updateStaff(staffId, updateData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Staff member updated successfully!");
    } catch (error) {
      console.error("Error updating staff member:", error);
      setError("Failed to update staff member. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Loading staff data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Staff Member</DialogTitle>
              <DialogDescription>
                Update the details for this staff member. Fields marked with *
                are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
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
                  Store *
                </Label>
                <Select
                  value={formData.id_store}
                  onValueChange={(value) =>
                    handleSelectChange("id_store", value)
                  }
                  disabled={storesLoading}
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Select a store" />
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
                  Phone *
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
                  Role
                </Label>
                <Select
                  value={formData.role || "STAFF"}
                  onValueChange={(value: string) => {
                    handleSelectChange("role", value as "STAFF" | "MANAGER");
                  }}
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Select a role" />
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
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={handleChange}
                    className={`${
                      passwordError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    } pr-10`}
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="status"
                    checked={!!formData.status}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    {formData.status ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
