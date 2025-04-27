import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { ServiceResponse } from "@/types/service.type";
import { getAllServices, deleteService } from "@/api/service.api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CreateServiceModal } from "@/components/modals/create-service-modal";
import { UpdateServiceModal } from "@/components/modals/update-service-modal";
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

export default function Services() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAllServices();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dịch vụ:", error);
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleServiceCreated = () => {
    // Refresh the service list after successful creation
    fetchServices();
  };

  const handleEditService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedServiceId(null);
  };

  const handleServiceUpdated = () => {
    // Refresh the service list after successful update
    fetchServices();
  };

  const handleDeleteService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedServiceId) return;

    setDeleteLoading(true);
    try {
      await deleteService(selectedServiceId);
      fetchServices();
      setIsDeleteDialogOpen(false);
      setSelectedServiceId(null);
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
    }
    setDeleteLoading(false);
  };

  // Define columns for service table
  const columns: ColumnDef<ServiceResponse>[] = [
    {
      accessorKey: "name",
      header: "Tên Dịch Vụ",
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price);
        return formatted;
      },
    },
    {
      accessorKey: "description",
      header: "Mô Tả",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        // Truncate long descriptions
        return description.length > 50
          ? `${description.substring(0, 50)}...`
          : description;
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const service = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditService(service._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteService(service._id)}
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
        <h1 className="text-2xl font-bold">Dịch Vụ</h1>
        <Button onClick={handleAddService} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Dịch Vụ</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu dịch vụ...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={services || []}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm theo tên dịch vụ..."
          />
          {services.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy dịch vụ
            </div>
          )}
        </div>
      )}

      <CreateServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleServiceCreated}
      />

      <UpdateServiceModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleServiceUpdated}
        serviceId={selectedServiceId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn dịch
              vụ và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedServiceId(null);
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
