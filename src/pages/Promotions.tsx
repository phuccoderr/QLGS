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
      console.error("Error fetching promotions:", error);
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
      console.error("Error deleting promotion:", error);
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

  // Define columns for promotion table
  const columns: ColumnDef<PromotionResponse>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
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
      header: "Type",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        const type = row.getValue("type") as string;

        return type === "Percentage"
          ? `${value}%`
          : new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.getValue("startDate") as string),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => formatDate(row.getValue("endDate") as string),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
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
        const promotion = row.original;

        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditPromotion(promotion._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeletePromotion(promotion._id)}
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
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Button
          onClick={handleAddPromotion}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>Add Promotion</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading promotions...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={promotions || []}
            searchColumn="name"
            searchPlaceholder="Search by promotion name..."
          />
          {promotions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No promotions found
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              promotion and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPromotionId(null);
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
