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
        console.error("Error fetching service:", error);
        setError("Failed to load service data. Please try again.");
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
        setPriceError("Price must be a positive number");
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
      setError("Service ID is missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateService(serviceId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Service updated successfully");
    } catch (error) {
      console.error("Error updating service:", error);
      setError("Failed to update service. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Loading service data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Service</DialogTitle>
              <DialogDescription>
                Update the details for this service. Click save when you're
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
                <Label htmlFor="price" className="text-right">
                  Price
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
                  Description
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
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !!priceError}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
