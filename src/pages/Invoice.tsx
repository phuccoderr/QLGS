import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye } from "lucide-react";
import { InvoiceResponse } from "@/types/invoice.type";
import { getAllInvoices, deleteInvoice } from "@/api/invoice.api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllStore } from "@/api/store.api";
import { getAllLaundryOrders } from "@/api/laundry_order.api";
import { StoreResponse } from "@/types/store.type";
import { LaundryOrderResponse } from "@/types/laundry_order.type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateInvoiceModal } from "@/components/modals/create-invoice-modal";
import { ViewInvoiceModal } from "@/components/modals/view-invoice-modal";

export default function Invoice() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrderResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchStores();
    fetchLaundryOrders();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAllInvoices();
      setInvoices(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu hóa đơn:", error);
      toast.error("Không thể tải dữ liệu hóa đơn");
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
    }
  };

  const fetchLaundryOrders = async () => {
    try {
      const data = await getAllLaundryOrders();
      setLaundryOrders(data);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng giặt:", error);
    }
  };

  const handleAddInvoice = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewInvoiceDetails = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoiceId) return;

    setDeleteLoading(true);
    try {
      await deleteInvoice(selectedInvoiceId);
      fetchInvoices();
      setIsDeleteDialogOpen(false);
      setSelectedInvoiceId(null);
      toast.success("Đã xóa hóa đơn thành công");
    } catch (error) {
      console.error("Lỗi khi xóa hóa đơn:", error);
      toast.error("Không thể xóa hóa đơn");
    }
    setDeleteLoading(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoiceId(null);
  };

  // Helper functions for displaying related data
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Cửa hàng không xác định";
  };

  const getLaundryOrderId = (orderId: string) => {
    const order = laundryOrders.find((o) => o._id === orderId);
    return order ? `#${order._id.slice(-6)}` : "Đơn hàng không xác định";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
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

  // Define columns for invoices table
  const columns: ColumnDef<InvoiceResponse>[] = [
    {
      accessorKey: "_id",
      header: "Mã Hóa Đơn",
      cell: ({ row }) => {
        const id = row.getValue("_id") as string;
        return `#${id.slice(-6)}`;
      },
    },
    {
      accessorKey: "id_laundry_order",
      header: "Mã Đơn Hàng",
      cell: ({ row }) => {
        const orderId = row.getValue("id_laundry_order") as string;
        return getLaundryOrderId(orderId);
      },
    },
    {
      accessorKey: "id_store",
      header: "Cửa Hàng",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      accessorKey: "date",
      header: "Ngày Hóa Đơn",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "total_price",
      header: "Tổng Tiền",
      cell: ({ row }) => {
        const amount = row.getValue("total_price") as number;
        return formatCurrency(amount);
      },
    },
    {
      accessorKey: "discount_price",
      header: "Giảm Giá",
      cell: ({ row }) => {
        const amount = row.getValue("discount_price") as number | undefined;
        return amount ? formatCurrency(amount) : "—";
      },
    },
    {
      accessorKey: "actual_price",
      header: "Thành Tiền",
      cell: ({ row }) => {
        const amount = row.getValue("actual_price") as number;
        return formatCurrency(amount);
      },
    },
    {
      accessorKey: "status",
      header: "Trạng Thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const translatedStatus =
          status.toLowerCase() === "paid"
            ? "Đã thanh toán"
            : status.toLowerCase() === "pending"
            ? "Đang chờ"
            : status.toLowerCase() === "cancelled"
            ? "Đã hủy"
            : status.toLowerCase() === "refunded"
            ? "Đã hoàn tiền"
            : status;

        return (
          <div
            className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${getStatusBadgeClass(
              status
            )}`}
          >
            {translatedStatus}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewInvoiceDetails(invoice._id)}
              title="Xem Chi Tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hóa Đơn</h1>
        <Button onClick={handleAddInvoice} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Hóa Đơn</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu hóa đơn...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={invoices || []}
            searchColumn="_id"
            searchPlaceholder="Tìm kiếm theo mã hóa đơn..."
          />
          {invoices.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy hóa đơn
            </div>
          )}
        </div>
      )}

      <ViewInvoiceModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        invoiceId={selectedInvoiceId || ""}
      />

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchInvoices}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn hóa
              đơn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedInvoiceId(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
