import { useState, useEffect } from "react";
import { StaffResponse } from "@/types/staff.type";
import { getAllStaff, deleteStaff, updateStaffStatus } from "@/api/staff.api";
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
import { CreateStaffModal } from "@/components/modals/create-staff-modal";
import { UpdateStaffModal } from "@/components/modals/update-staff-modal";

export default function Staff() {
  const [staffMembers, setStaffMembers] = useState<StaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllStaff();
      setStaffMembers(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhân viên:", error);
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (
    staffId: string,
    currentStatus: boolean
  ) => {
    setStatusUpdateLoading(staffId);
    try {
      await updateStaffStatus(staffId, !currentStatus);

      // Update local state to reflect the change
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff._id === staffId ? { ...staff, status: !currentStatus } : staff
        )
      );

      toast.success(
        `Đã cập nhật trạng thái nhân viên thành ${
          !currentStatus ? "hoạt động" : "không hoạt động"
        }`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
      toast.error("Không thể cập nhật trạng thái nhân viên");
    }
    setStatusUpdateLoading(null);
  };

  const confirmDelete = async () => {
    if (!selectedStaffId) return;

    setDeleteLoading(true);
    try {
      await deleteStaff(selectedStaffId);
      fetchStaffMembers();
      setIsDeleteDialogOpen(false);
      setSelectedStaffId(null);
      toast.success("Đã xóa nhân viên thành công");
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      toast.error("Không thể xóa nhân viên");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedStaffId(null);
  };

  const handleStaffCreated = () => {
    // Refresh the staff list after successful creation
    fetchStaffMembers();
  };

  const handleStaffUpdated = () => {
    // Refresh the staff list after successful update
    fetchStaffMembers();
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for staff table
  const columns: ColumnDef<StaffResponse>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "email",
      header: "Email",
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
      accessorKey: "role",
      header: "Vai Trò",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "id_store",
      header: "Cửa Hàng",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        // In a real implementation, you might want to fetch store details
        // or have a mapping of store IDs to names
        return storeId || "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Trạng Thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        const staffId = row.original._id;
        const isLoading = statusUpdateLoading === staffId;

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={status}
              onCheckedChange={() => handleToggleStatus(staffId, status)}
              disabled={isLoading}
            />
            <Badge variant={status ? "default" : "secondary"}>
              {status ? "Hoạt động" : "Không hoạt động"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày Tạo",
      cell: ({ row }) => formatDate(row.getValue("createdAt") as string),
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const staff = row.original;

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
              onClick={() => handleEditStaff(staff._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteStaff(staff._id)}
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
        <h1 className="text-2xl font-bold">Quản Lý Nhân Viên</h1>
        <Button onClick={handleAddStaff} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Nhân Viên</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu nhân viên...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={staffMembers || []}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm theo tên..."
          />
          {staffMembers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy nhân viên
            </div>
          )}
        </div>
      )}

      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleStaffCreated}
      />

      <UpdateStaffModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleStaffUpdated}
        staffId={selectedStaffId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn nhân
              viên và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedStaffId(null);
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
