import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye } from "lucide-react";
import { DeliveryResponse } from "@/types/delivery.type";
import { getAllDeliveries, deleteDelivery } from "@/api/delivery.api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllLaundryOrders } from "@/api/laundry_order.api";
import { getAllStore } from "@/api/store.api";
import { getAllStaff } from "@/api/staff.api";
import { LaundryOrderResponse } from "@/types/laundry_order.type";
import { StoreResponse } from "@/types/store.type";
import { StaffResponse } from "@/types/staff.type";
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
import { CreateDeliveryModal } from "@/components/modals/create-delivery-modal";

export default function Delivery() {
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrderResponse[]>(
    []
  );
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    fetchLaundryOrders();
    fetchStores();
    fetchStaff();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await getAllDeliveries();
      setDeliveries(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Failed to load deliveries");
      setLoading(false);
    }
  };

  const fetchLaundryOrders = async () => {
    try {
      const data = await getAllLaundryOrders();
      setLaundryOrders(data);
    } catch (error) {
      console.error("Error fetching laundry orders:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleAddDelivery = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewDeliveryDetails = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setIsDetailModalOpen(true);
  };

  const handleDeleteDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeliveryId) return;

    setDeleteLoading(true);
    try {
      await deleteDelivery(selectedDeliveryId);
      fetchDeliveries();
      setIsDeleteDialogOpen(false);
      setSelectedDeliveryId(null);
      toast.success("Delivery record deleted successfully");
    } catch (error) {
      console.error("Error deleting delivery:", error);
      toast.error("Failed to delete delivery record");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDeliveryId(null);
  };

  const handleDeliveryCreated = () => {
    fetchDeliveries();
  };

  // Helper functions for displaying related data
  const getLaundryOrderId = (orderId: string) => {
    const order = laundryOrders.find((o) => o._id === orderId);
    return order ? `#${order._id.slice(-6)}` : "Unknown Order";
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Unknown Store";
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s._id === staffId);
    return staffMember ? staffMember.name : "Unknown Staff";
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in delivery":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Define columns for deliveries table
  const columns: ColumnDef<DeliveryResponse>[] = [
    {
      accessorKey: "_id",
      header: "Delivery ID",
      cell: ({ row }) => {
        const id = row.getValue("_id") as string;
        return `#${id.slice(-6)}`;
      },
    },
    {
      accessorKey: "id_laundry_order",
      header: "Order ID",
      cell: ({ row }) => {
        const orderId = row.getValue("id_laundry_order") as string;
        return getLaundryOrderId(orderId);
      },
    },
    {
      accessorKey: "id_delivery_staff",
      header: "Delivery Staff",
      cell: ({ row }) => {
        const staffId = row.getValue("id_delivery_staff") as string;
        return getStaffName(staffId);
      },
    },
    {
      accessorKey: "id_store",
      header: "Store",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      accessorKey: "delivery_address",
      header: "Address",
      cell: ({ row }) => {
        return row.getValue("delivery_address") as string;
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone Number",
      cell: ({ row }) => {
        return row.getValue("phone_number") as string;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div
            className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${getStatusBadgeClass(
              status
            )}`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return format(new Date(date), "dd/MM/yyyy");
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const delivery = row.original;
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleViewDeliveryDetails(delivery._id)}
              title="View Details"
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
        <h1 className="text-2xl font-bold">Deliveries</h1>
        <Button onClick={handleAddDelivery} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Delivery</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading deliveries...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={deliveries || []}
            searchColumn="_id"
            searchPlaceholder="Search by delivery ID..."
          />
          {deliveries.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No deliveries found
            </div>
          )}
        </div>
      )}

      <CreateDeliveryModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleDeliveryCreated}
        laundryOrders={laundryOrders}
        stores={stores}
        staff={staff}
      />

      {/* TODO: Implement DetailDeliveryModal component */}
      {/* <DetailDeliveryModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        deliveryId={selectedDeliveryId || ""}
      /> */}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              delivery record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedDeliveryId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
