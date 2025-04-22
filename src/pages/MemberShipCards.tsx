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
      console.error("Error fetching membership cards:", error);
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
      console.error("Error deleting membership card:", error);
    }
    setDeleteLoading(false);
  };

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for membership card table
  const columns: ColumnDef<MemberShipCardResponse>[] = [
    {
      accessorKey: "so_the",
      header: "Card Number",
    },
    {
      accessorKey: "id_khachhang",
      header: "Customer ID",
    },
    {
      accessorKey: "ngay_cap",
      header: "Issue Date",
      cell: ({ row }) => formatDate(row.getValue("ngay_cap") as string),
    },
    {
      accessorKey: "ngay_het_han",
      header: "Expiry Date",
      cell: ({ row }) => formatDate(row.getValue("ngay_het_han") as string),
    },
    {
      accessorKey: "diem_tich_luy",
      header: "Points",
      cell: ({ row }) => {
        const points = row.getValue("diem_tich_luy") as number;
        return <span className="font-medium">{points.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "trangthai",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("trangthai") as boolean;
        return (
          <Badge variant={status ? "default" : "secondary"}>
            {status ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const card = row.original;

        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditCard(card._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteCard(card._id)}
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
        <h1 className="text-2xl font-bold">Membership Cards</h1>
        <Button onClick={handleAddCard} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Membership Card</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading membership cards...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={membershipCards || []}
            searchColumn="so_the"
            searchPlaceholder="Search by card number..."
          />
          {membershipCards.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No membership cards found
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              membership card and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCardId(null);
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
