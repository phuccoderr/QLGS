import { useState, useEffect } from "react";
import { StoreResponse } from "@/types/store.type";
import { getAllStore, deleteStore, updateStoreStatus } from "@/api/store.api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreateStoreModal } from "@/components/modals/create-store-modal";
import { UpdateStoreModal } from "@/components/modals/update-store-modal";

export default function Store() {
  const [storeItems, setStoreItems] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    setLoading(true);
    try {
      const data = await getAllStore();
      setStoreItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
      setLoading(false);
    }
  };

  const handleAddStore = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (
    storeId: string,
    currentStatus: boolean
  ) => {
    setStatusUpdateLoading(storeId);
    try {
      await updateStoreStatus(storeId, !currentStatus);

      // Update local state to reflect the change
      setStoreItems((prev) =>
        prev.map((store) =>
          store._id === storeId ? { ...store, status: !currentStatus } : store
        )
      );

      toast.success(
        `Đã cập nhật trạng thái cửa hàng thành ${
          !currentStatus ? "hoạt động" : "không hoạt động"
        }`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái cửa hàng:", error);
      toast.error("Không thể cập nhật trạng thái cửa hàng");
    }
    setStatusUpdateLoading(null);
  };

  const confirmDelete = async () => {
    if (!selectedStoreId) return;

    setDeleteLoading(true);
    try {
      await deleteStore(selectedStoreId);
      fetchStoreItems();
      setIsDeleteDialogOpen(false);
      setSelectedStoreId(null);
      toast.success("Đã xóa cửa hàng thành công");
    } catch (error) {
      console.error("Lỗi khi xóa cửa hàng:", error);
      toast.error("Không thể xóa cửa hàng");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedStoreId(null);
  };

  const handleStoreCreated = () => {
    // Refresh the store list after successful creation
    fetchStoreItems();
  };

  const handleStoreUpdated = () => {
    // Refresh the store list after successful update
    fetchStoreItems();
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for store table
  const columns: ColumnDef<StoreResponse>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "phoneNumber",
      header: "Số Điện Thoại",
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phoneNumber") as string;
        return phoneNumber || "N/A";
      },
    },
    {
      accessorKey: "address",
      header: "Địa Chỉ",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        if (!address) return "N/A";
        // Truncate long addresses
        return address.length > 30 ? `${address.substring(0, 30)}...` : address;
      },
    },
    {
      accessorKey: "id_manager",
      header: "Manager",
      cell: ({ row }) => {
        const managerId = row.getValue("id_manager") as string;
        if (!managerId) return "N/A";

        // Find manager name if available
        const manager = storeItems.find((store) => store._id === managerId);
        return manager ? manager.name : managerId;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        const storeId = row.original._id;
        const isLoading = statusUpdateLoading === storeId;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={status}
              onCheckedChange={() => handleToggleStatus(storeId, status)}
              disabled={isLoading}
            />
            <Badge variant={status ? "default" : "secondary"}>
              {status ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.getValue("createdAt") as string),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const store = row.original;

        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditStore(store._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteStore(store._id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Store Management</h1>
        <Button onClick={handleAddStore} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Store</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading stores...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={storeItems || []}
            searchColumn="name"
            searchPlaceholder="Search by name..."
          />
          {storeItems.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No stores found
            </div>
          )}
        </div>
      )}

      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleStoreCreated}
      />

      <UpdateStoreModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleStoreUpdated}
        storeId={selectedStoreId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              store and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedStoreId(null);
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
