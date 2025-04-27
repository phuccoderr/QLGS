import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye, CreditCard } from "lucide-react";
import { MemberShipCardResponse } from "@/types/membership-card.type";
import {
  getAllMembershipCards,
  deleteMembershipCard,
  updateMembershipCardPoints,
} from "@/api/membership-card.api";
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
import { CreateMembershipCardModal } from "@/components/modals/create-membership-card-modal";
import { UpdateMembershipCardModal } from "@/components/modals/update-membership-card-modal";

export default function MemberShipCards() {
  const [membershipCards, setMembershipCards] = useState<
    MemberShipCardResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMembershipCards();
  }, []);

  const fetchMembershipCards = async () => {
    setLoading(true);
    try {
      const data = await getAllMembershipCards();
      setMembershipCards(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thẻ thành viên:", error);
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCardCreated = () => {
    // Refresh the card list after successful creation
    fetchMembershipCards();
  };

  const handleEditCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedCardId(null);
  };

  const handleCardUpdated = () => {
    // Refresh the card list after successful update
    fetchMembershipCards();
  };

  const handleDeleteCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCardId) return;

    setDeleteLoading(true);
    try {
      await deleteMembershipCard(selectedCardId);
      fetchMembershipCards();
      setIsDeleteDialogOpen(false);
      setSelectedCardId(null);
    } catch (error) {
      console.error("Lỗi khi xóa thẻ thành viên:", error);
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

  // Define columns for membership card table
  const columns: ColumnDef<MemberShipCardResponse>[] = [
    {
      accessorKey: "card_number",
      header: "Số Thẻ",
    },
    {
      accessorKey: "id_customer",
      header: "Mã Khách Hàng",
    },
    {
      accessorKey: "issue_date",
      header: "Ngày Phát Hành",
      cell: ({ row }) => formatDate(row.getValue("issue_date") as string),
    },
    {
      accessorKey: "expiry_date",
      header: "Ngày Hết Hạn",
      cell: ({ row }) => formatDate(row.getValue("expiry_date") as string),
    },
    {
      accessorKey: "points",
      header: "Điểm",
      cell: ({ row }) => {
        const points = row.getValue("points") as number;
        return <span className="font-medium">{points.toLocaleString()}</span>;
      },
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
        const card = row.original;

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
              onClick={() => handleEditCard(card._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteCard(card._id)}
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
        <h1 className="text-2xl font-bold">Thẻ Thành Viên</h1>
        <Button onClick={handleAddCard} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Thêm Thẻ Thành Viên</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu thẻ thành viên...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={membershipCards || []}
            searchColumn="card_number"
            searchPlaceholder="Tìm kiếm theo số thẻ..."
          />
          {membershipCards.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy thẻ thành viên
            </div>
          )}
        </div>
      )}

      <CreateMembershipCardModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleCardCreated}
      />

      <UpdateMembershipCardModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleCardUpdated}
        cardId={selectedCardId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn thẻ
              thành viên và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCardId(null);
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
