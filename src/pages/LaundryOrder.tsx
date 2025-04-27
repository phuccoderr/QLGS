import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye } from "lucide-react";
import { LaundryOrderResponse } from "@/types/laundry_order.type";
import {
  getAllLaundryOrders,
  deleteLaundryOrder,
} from "@/api/laundry_order.api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllServices } from "@/api/service.api";
import { getAllGoods } from "@/api/goods.api";
import { getAllStore } from "@/api/store.api";
import { getAllStaff } from "@/api/staff.api";
import { getAllCustomers } from "@/api/customer.api";
import { ServiceResponse } from "@/types/service.type";
import { GoodsResponse } from "@/types/goods.type";
import { StoreResponse } from "@/types/store.type";
import { StaffResponse } from "@/types/staff.type";
import { CustomerResponse } from "@/types/customer.type";
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
import { CreateLaundryOrderModal } from "@/components/modals/create-laundry-order-modal";
import { DetailLaundryOrderModal } from "@/components/modals/detail-laundry-order-modal";

export default function LaundryOrder() {
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrderResponse[]>(
    []
  );
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [goods, setGoods] = useState<GoodsResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchLaundryOrders();
    fetchServices();
    fetchGoods();
    fetchStores();
    fetchStaff();
    fetchCustomers();
  }, []);

  const fetchLaundryOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllLaundryOrders();
      console.log(data);
      setLaundryOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng giặt:", error);
      toast.error("Không thể tải đơn hàng giặt");
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dịch vụ:", error);
    }
  };

  const fetchGoods = async () => {
    try {
      const data = await getAllGoods();
      setGoods(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu hàng hóa:", error);
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

  const fetchStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhân viên:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khách hàng:", error);
    }
  };

  const handleAddOrder = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;

    setDeleteLoading(true);
    try {
      await deleteLaundryOrder(selectedOrderId);
      fetchLaundryOrders();
      setIsDeleteDialogOpen(false);
      setSelectedOrderId(null);
      toast.success("Đã xóa đơn hàng giặt thành công");
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng giặt:", error);
      toast.error("Không thể xóa đơn hàng giặt");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleOrderCreated = () => {
    fetchLaundryOrders();
  };

  const handleOrderUpdated = () => {
    fetchLaundryOrders();
  };

  // Helper functions for displaying related data
  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s._id === serviceId);
    return service ? service.name : "Dịch vụ không xác định";
  };

  const getGoodsName = (goodsId?: string) => {
    if (!goodsId) return "N/A";
    const item = goods.find((g) => g._id === goodsId);
    return item ? item.name : "Hàng hóa không xác định";
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c._id === customerId);
    return customer ? customer.name : "Khách hàng không xác định";
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Cửa hàng không xác định";
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s._id === staffId);
    return staffMember ? staffMember.name : "Nhân viên không xác định";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Define columns for laundry orders table
  const columns: ColumnDef<LaundryOrderResponse>[] = [
    {
      accessorKey: "id_store",
      header: "Cửa Hàng",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      accessorKey: "id_customer",
      header: "Khách Hàng",
      cell: ({ row }) => {
        const customerId = row.getValue("id_customer") as string;
        return getCustomerName(customerId);
      },
    },
    {
      accessorKey: "id_staff",
      header: "Nhân Viên",
      cell: ({ row }) => {
        const staffId = row.getValue("id_staff") as string;
        return getStaffName(staffId);
      },
    },
    {
      accessorKey: "status",
      header: "Trạng Thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const translatedStatus =
          status === "Completed"
            ? "Hoàn thành"
            : status === "Processing"
            ? "Đang xử lý"
            : status === "Delivered"
            ? "Đã giao"
            : status === "Cancelled"
            ? "Đã hủy"
            : "Đang chờ";

        return (
          <div
            className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
              status === "Completed"
                ? "bg-green-100 text-green-800"
                : status === "Processing"
                ? "bg-blue-100 text-blue-800"
                : status === "Delivered"
                ? "bg-purple-100 text-purple-800"
                : status === "Cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {translatedStatus}
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng Tiền",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return formatCurrency(amount);
      },
    },
    {
      accessorKey: "amountPaid",
      header: "Đã Thanh Toán",
      cell: ({ row }) => {
        const amount = row.getValue("amountPaid") as number;
        return formatCurrency(amount);
      },
    },
    {
      accessorKey: "receivedDate",
      header: "Ngày Nhận",
      cell: ({ row }) => {
        const date = row.getValue("receivedDate") as string;
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      accessorKey: "returnedDate",
      header: "Ngày Trả",
      cell: ({ row }) => {
        const date = row.getValue("returnedDate") as string | undefined;
        return date ? format(new Date(date), "dd/MM/yyyy") : "—";
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewOrderDetails(order._id)}
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
        <h1 className="text-2xl font-bold">Đơn Hàng Giặt</h1>
        <Button onClick={handleAddOrder} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Đơn Hàng</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải đơn hàng giặt...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={laundryOrders || []}
            searchColumn="id_service"
            searchPlaceholder="Tìm kiếm theo mã dịch vụ..."
          />
          {laundryOrders?.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy đơn hàng giặt
            </div>
          )}
        </div>
      )}

      <CreateLaundryOrderModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleOrderCreated}
        services={services}
        goods={goods}
      />

      <DetailLaundryOrderModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        orderId={selectedOrderId || ""}
      />

      {/* TODO: Implement UpdateLaundryOrderModal component */}
      {/* <UpdateLaundryOrderModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleOrderUpdated}
        orderId={selectedOrderId || ""}
        services={services}
        goods={goods}
      /> */}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn đơn
              hàng giặt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedOrderId(null);
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
