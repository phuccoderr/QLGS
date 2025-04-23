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
import { InvoiceResponse } from "@/types/invoice.type";
import { getInvoiceById } from "@/api/invoice.api";
import { format } from "date-fns";
import { getAllStore } from "@/api/store.api";
import { getLaundryOrderById } from "@/api/laundry_order.api";
import { Printer, DownloadIcon } from "lucide-react";

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
}

export function ViewInvoiceModal({
  isOpen,
  onClose,
  invoiceId,
}: ViewInvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceData();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceData = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");

    try {
      const invoiceData = await getInvoiceById(invoiceId);
      setInvoice(invoiceData);

      // Fetch store info
      const storeData = await getAllStore();
      const store = storeData.find((s) => s._id === invoiceData.id_store);
      setStoreName(store ? store.name : "Unknown Store");

      // Fetch laundry order details
      const orderData = await getLaundryOrderById(invoiceData.id_laundry_order);
      setOrderDetails(orderData);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      setError("Failed to load invoice details. Please try again.");
    }

    setLoading(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice && !loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">Loading invoice details...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : invoice ? (
          <div className="space-y-6 print:p-10">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Invoice Details</DialogTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="print:hidden"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
              <DialogDescription>
                Invoice #{invoice._id.slice(-6)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Store</h3>
                <p>{storeName}</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium">Date</h3>
                <p>{format(new Date(invoice.date), "dd/MM/yyyy")}</p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Laundry Order</h3>
                <p>#{invoice.id_laundry_order.slice(-6)}</p>
              </div>
              <div className="text-right">
                <h3 className="font-medium">Status</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${getStatusClass(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>

            {orderDetails && (
              <div>
                <h3 className="font-medium border-b pb-2 mb-2">
                  Order Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer:</p>
                    <p>{orderDetails.customer_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone:</p>
                    <p>{orderDetails.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium border-b pb-2 mb-2">
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span>{formatCurrency(invoice.total_price)}</span>
                </div>
                {invoice.discount_price !== undefined && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>{formatCurrency(invoice.discount_price)}</span>
                  </div>
                )}
                {invoice.shipping_fee !== undefined && (
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span>{formatCurrency(invoice.shipping_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(invoice.actual_price)}</span>
                </div>
              </div>
            </div>

            {invoice.note && (
              <div>
                <h3 className="font-medium border-b pb-2 mb-2">Notes</h3>
                <p className="text-sm">{invoice.note}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>
                Created:{" "}
                {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
              <p>
                Last Updated:{" "}
                {format(new Date(invoice.updatedAt), "dd/MM/yyyy HH:mm")}
              </p>
            </div>

            <DialogFooter className="print:hidden">
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-6 text-center">Invoice not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
