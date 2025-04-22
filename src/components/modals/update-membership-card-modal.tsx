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
    id_khachhang: "",
    so_the: "",
    ngay_cap: undefined,
    ngay_het_han: undefined,
    diem_tich_luy: undefined,
    trangthai: undefined,
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
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    }
  };

  const fetchCardData = async () => {
    if (!cardId) return;

    setFetchLoading(true);
    try {
      const cardData = await getMembershipCardById(cardId);
      setFormData({
        id_khachhang: cardData.id_khachhang,
        so_the: cardData.so_the,
        ngay_cap: new Date(cardData.ngay_cap),
        ngay_het_han: new Date(cardData.ngay_het_han),
        diem_tich_luy: cardData.diem_tich_luy,
        trangthai: cardData.trangthai,
      });
      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching membership card:", error);
      setError("Failed to load membership card data. Please try again.");
      setFetchLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Card number validation
    if (name === "so_the") {
      if (!value) {
        setCardNumberError("Card number is required");
      } else if (!/^[A-Z0-9]{8,}$/.test(value)) {
        setCardNumberError(
          "Card number must be at least 8 alphanumeric characters (uppercase)"
        );
      } else {
        setCardNumberError("");
      }
    }

    // Date validation
    if (name === "ngay_het_han" && formData.ngay_cap) {
      const expiryDate = new Date(value);

      if (expiryDate <= formData.ngay_cap) {
        setDateError("Expiry date must be after issue date");
      } else {
        setDateError("");
      }
    }

    if (name === "ngay_cap" && formData.ngay_het_han) {
      const issueDate = new Date(value);

      if (formData.ngay_het_han <= issueDate) {
        setDateError("Expiry date must be after issue date");
      } else {
        setDateError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "ngay_cap" || name === "ngay_het_han"
          ? new Date(value)
          : name === "diem_tich_luy"
          ? parseInt(value, 10)
          : name === "trangthai"
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
        diem_tich_luy: updatedCard.diem_tich_luy,
      }));
      setPointsToAdd(0);
      toast.success(
        `${Math.abs(pointsToAdd)} points ${
          pointsToAdd > 0 ? "added to" : "subtracted from"
        } card`
      );
    } catch (error) {
      console.error("Error updating points:", error);
      setError("Failed to update points. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (formData.so_the && !/^[A-Z0-9]{8,}$/.test(formData.so_the)) {
      setCardNumberError(
        "Card number must be at least 8 alphanumeric characters (uppercase)"
      );
      hasError = true;
    }

    if (
      formData.ngay_het_han &&
      formData.ngay_cap &&
      formData.ngay_het_han <= formData.ngay_cap
    ) {
      setDateError("Expiry date must be after issue date");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (!cardId) {
      setError("Card ID is missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateMembershipCard(cardId, formData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Membership card updated successfully");
    } catch (error) {
      console.error("Error updating membership card:", error);
      setError("Failed to update membership card. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {fetchLoading ? (
          <div className="py-6 text-center">
            Loading membership card data...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Membership Card</DialogTitle>
              <DialogDescription>
                Update the details for this membership card. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_khachhang" className="text-right">
                  Customer
                </Label>
                <select
                  id="id_khachhang"
                  name="id_khachhang"
                  value={formData.id_khachhang}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="so_the" className="text-right">
                  Card Number
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="so_the"
                    name="so_the"
                    value={formData.so_the}
                    onChange={handleChange}
                    className={cardNumberError ? "border-destructive" : ""}
                    placeholder="e.g. CARD12345"
                    required
                  />
                  {cardNumberError && (
                    <p className="text-xs text-destructive">
                      {cardNumberError}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ngay_cap" className="text-right">
                  Issue Date
                </Label>
                <Input
                  id="ngay_cap"
                  name="ngay_cap"
                  type="date"
                  value={formData.ngay_cap?.toISOString().split("T")[0] || ""}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ngay_het_han" className="text-right">
                  Expiry Date
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="ngay_het_han"
                    name="ngay_het_han"
                    type="date"
                    value={
                      formData.ngay_het_han?.toISOString().split("T")[0] || ""
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
                <Label htmlFor="diem_tich_luy" className="text-right">
                  Points
                </Label>
                <div className="col-span-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">
                      Current: <strong>{formData.diem_tich_luy}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={pointsToAdd}
                      onChange={handlePointsChange}
                      placeholder="Points to add/subtract"
                      className="w-full"
                    />
                    <Button
                      type="button"
                      onClick={handleAddPoints}
                      disabled={loading || pointsToAdd === 0}
                      size="sm"
                    >
                      {pointsToAdd >= 0 ? "Add" : "Subtract"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Enter negative value to subtract points)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trangthai" className="text-right">
                  Status
                </Label>
                <select
                  id="trangthai"
                  name="trangthai"
                  value={formData.trangthai?.toString()}
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
                disabled={loading || !!cardNumberError || !!dateError}
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
