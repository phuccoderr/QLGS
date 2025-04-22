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
import { getPromotionById, updatePromotion } from "@/api/promotion.api";
import {
  UpdatePromotionRequestType,
  PromotionResponse,
} from "@/types/promotion.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UpdatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotionId: string | null;
}

export function UpdatePromotionModal({
  isOpen,
  onClose,
  onSuccess,
  promotionId,
}: UpdatePromotionModalProps) {
  const [formData, setFormData] = useState<UpdatePromotionRequestType>({
    name: "",
    description: "",
    type: "Percentage",
    value: 0,
    startDate: "",
    endDate: "",
    status: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [valueError, setValueError] = useState("");
  const [dateError, setDateError] = useState("");

  // Fetch promotion data when modal opens and promotionId changes
  useEffect(() => {
    const fetchPromotionData = async () => {
      if (!promotionId || !isOpen) return;

      setFetchLoading(true);
      try {
        const promotionData = await getPromotionById(promotionId);
        setFormData({
          name: promotionData.name,
          description: promotionData.description,
          type: promotionData.type,
          value: promotionData.value,
          startDate: new Date(promotionData.startDate)
            .toISOString()
            .split("T")[0],
          endDate: new Date(promotionData.endDate).toISOString().split("T")[0],
          status: promotionData.status,
        });
        setFetchLoading(false);
      } catch (error) {
        console.error("Error fetching promotion:", error);
        setError("Failed to load promotion data. Please try again.");
        setFetchLoading(false);
      }
    };

    fetchPromotionData();
  }, [promotionId, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "value") {
      const valueNum = parseFloat(value);
      if (isNaN(valueNum) || valueNum <= 0) {
        setValueError("Value must be a positive number");
      } else if (formData.type === "Percentage" && valueNum > 100) {
        setValueError("Percentage cannot be greater than 100%");
      } else {
        setValueError("");
      }
      setFormData((prev) => ({
        ...prev,
        [name]: valueNum,
      }));
    } else if (name === "type") {
      // Reset value error when type changes
      if (value === "Percentage" && formData.value && formData.value > 100) {
        setValueError("Percentage cannot be greater than 100%");
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
          setDateError("End date must be after start date");
        } else {
          setDateError("");
        }
      } else if (name === "startDate" && formData.endDate && value) {
        if (new Date(formData.endDate) <= new Date(value)) {
          setDateError("End date must be after start date");
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

    if (!promotionId) {
      setError("Promotion ID is missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updatePromotion(promotionId, formData);
      toast.success("Promotion updated successfully");
      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating promotion:", error);
      setError("Failed to update promotion. Please try again.");
      toast.error("Failed to update promotion");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">Loading promotion data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Promotion</DialogTitle>
              <DialogDescription>
                Update the details for this promotion. Click save when you're
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
                <Label htmlFor="description" className="text-right">
                  Description
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
                  Type
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
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
                  Start Date
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
                  End Date
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
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status?.toString()}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !!valueError || !!dateError}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
