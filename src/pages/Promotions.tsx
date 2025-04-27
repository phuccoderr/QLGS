import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { PromotionResponse } from "@/types/promotion.type";
import { getAllPromotions, deletePromotion } from "@/api/promotion.api";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CreatePromotionModal } from "@/components/modals/create-promotion-modal";
import { UpdatePromotionModal } from "@/components/modals/update-promotion-modal";
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

export default function Promotions() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await getAllPromotions();
      setPromotions(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khuyến mãi:", error);
      setLoading(false);
    }
  };

  const handleAddPromotion = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePromotionCreated = () => {
    // Refresh the promotion list after successful creation
    fetchPromotions();
  };

  const handleEditPromotion = (promotionId: string) => {
    setSelectedPromotionId(promotionId);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPromotionId(null);
  };

  const handlePromotionUpdated = () => {
    // Refresh the promotion list after successful update
    fetchPromotions();
  };

  const handleDeletePromotion = (promotionId: string) => {
    setSelectedPromotionId(promotionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPromotionId) return;

    setDeleteLoading(true);
    try {
      await deletePromotion(selectedPromotionId);
      fetchPromotions();
      setIsDeleteDialogOpen(false);
      setSelectedPromotionId(null);
    } catch (error) {
      console.error("Lỗi khi xóa khuyến mãi:", error);
    }
    setDeleteLoading(false);
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for promotion table
  const columns: ColumnDef<PromotionResponse>[] = [
    {
      accessorKey: "name",
      header: "Tên",
    },
    {
      accessorKey: "description",
      header: "Mô Tả",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        // Truncate long descriptions
        return description.length > 30
          ? `${description.substring(0, 30)}...`
          : description;
      },
    },
    {
      accessorKey: "type",
      header: "Loại",
    },
    {
      accessorKey: "value",
      header: "Giá Trị",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const type = row.getValue("type") as string;

        return type === "Percentage"
          ? `${value}%`
          : new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value);
      },
    },
    {
      accessorKey: "startDate",
      header: "Ngày Bắt Đầu",
      cell: ({ row }) => formatDate(row.getValue("startDate") as string),
    },
    {
      accessorKey: "endDate",
      header: "Ngày Kết Thúc",
      cell: ({ row }) => formatDate(row.getValue("endDate") as string),
    },
    {
      accessorKey: "status",
      header: "Trạng Thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <Badge variant={status ? "default" : "secondary"}>
            {status ? "Hoạt động" : "Không hoạt động"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const promotion = row.original;

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
              onClick={() => handleEditPromotion(promotion._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeletePromotion(promotion._id)}
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
        <h1 className="text-2xl font-bold">Khuyến Mãi</h1>
        <Button
          onClick={handleAddPromotion}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>Thêm Khuyến Mãi</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu khuyến mãi...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={promotions || []}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm theo tên khuyến mãi..."
          />
          {promotions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy khuyến mãi
            </div>
          )}
        </div>
      )}

      <CreatePromotionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePromotionCreated}
      />

      <UpdatePromotionModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handlePromotionUpdated}
        promotionId={selectedPromotionId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn khuyến
              mãi và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPromotionId(null);
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
