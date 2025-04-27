import { useState, useEffect } from "react";
import { SupplierResponse } from "@/types/supplier.type";
import { getAllSuppliers, deleteSupplier } from "@/api/supplier.api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Store } from "lucide-react";
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
import { toast } from "sonner";
import { getAllStore } from "@/api/store.api";
import { StoreResponse } from "@/types/store.type";
import { CreateSupplierModal } from "@/components/modals/create-supplier-modal";
import { UpdateSupplierModal } from "@/components/modals/update-supplier-modal";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchStores();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhà cung cấp:", error);
      toast.error("Không thể tải dữ liệu nhà cung cấp");
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
      toast.error("Không thể tải dữ liệu cửa hàng");
    }
  };

  const handleAddSupplier = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSupplierId) return;

    setDeleteLoading(true);
    try {
      await deleteSupplier(selectedSupplierId);
      fetchSuppliers();
      setIsDeleteDialogOpen(false);
      setSelectedSupplierId(null);
      toast.success("Đã xóa nhà cung cấp thành công");
    } catch (error) {
      console.error("Lỗi khi xóa nhà cung cấp:", error);
      toast.error("Không thể xóa nhà cung cấp");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedSupplierId(null);
  };

  const handleSupplierCreated = () => {
    fetchSuppliers();
  };

  const handleSupplierUpdated = () => {
    fetchSuppliers();
  };

  // Helper function to get store name by ID
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Cửa hàng không xác định";
  };

  // Define columns for supplier table
  const columns: ColumnDef<SupplierResponse>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "phone",
      header: "Điện Thoại",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return phone || "N/A";
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
      accessorKey: "id_store",
      header: "Cửa Hàng",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const supplier = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditSupplier(supplier._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteSupplier(supplier._id)}
              title="Xóa"
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
        <h1 className="text-2xl font-bold">Nhà Cung Cấp</h1>
        <Button onClick={handleAddSupplier} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Nhà Cung Cấp</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu nhà cung cấp...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={suppliers || []}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm theo tên..."
          />
          {suppliers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy nhà cung cấp
            </div>
          )}
        </div>
      )}

      <CreateSupplierModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleSupplierCreated}
        stores={stores}
      />

      <UpdateSupplierModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleSupplierUpdated}
        supplierId={selectedSupplierId || ""}
        stores={stores}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn nhà
              cung cấp và loại bỏ nó khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedSupplierId(null);
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
