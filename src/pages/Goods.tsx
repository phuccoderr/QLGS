import { useState, useEffect } from "react";
import { GoodsResponse } from "@/types/goods.type";
import { getAllGoods, deleteGoods, updateGoods } from "@/api/goods.api";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Trash,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CreateGoodsModal } from "@/components/modals/create-goods-modal";
import { UpdateGoodsModal } from "@/components/modals/update-goods-modal";

export default function Goods() {
  const [goods, setGoods] = useState<GoodsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedGoodsId, setSelectedGoodsId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    setLoading(true);
    try {
      const data = await getAllGoods();
      setGoods(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching goods:", error);
      setLoading(false);
      toast.error("Failed to load goods data");
    }
  };

  const handleAddGoods = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGoods = (goodsId: string) => {
    setSelectedGoodsId(goodsId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteGoods = (goodsId: string) => {
    setSelectedGoodsId(goodsId);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (
    goodsId: string,
    currentStatus: boolean
  ) => {
    setStatusUpdateLoading(true);
    try {
      await updateGoods(goodsId, { status: !currentStatus });
      toast.success(
        `Goods status updated to ${!currentStatus ? "active" : "inactive"}`
      );
      fetchGoods();
    } catch (error) {
      console.error("Error updating goods status:", error);
      toast.error("Failed to update goods status");
    }
    setStatusUpdateLoading(false);
  };

  const confirmDelete = async () => {
    if (!selectedGoodsId) return;

    setDeleteLoading(true);
    try {
      await deleteGoods(selectedGoodsId);
      fetchGoods();
      setIsDeleteDialogOpen(false);
      setSelectedGoodsId(null);
      toast.success("Goods deleted successfully");
    } catch (error) {
      console.error("Error deleting goods:", error);
      toast.error("Failed to delete goods");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedGoodsId(null);
  };

  const handleGoodsCreated = () => {
    // Refresh the goods list after successful creation
    fetchGoods();
  };

  const handleGoodsUpdated = () => {
    // Refresh the goods list after successful update
    fetchGoods();
  };

  // Define columns for goods table
  const columns: ColumnDef<GoodsResponse>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const goods = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToggleStatus(goods._id, goods.status)}
              disabled={statusUpdateLoading}
            >
              {goods.status ? (
                <ToggleRight className="h-4 w-4 text-green-500" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-red-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditGoods(goods._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteGoods(goods._id)}
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
        <h1 className="text-2xl font-bold">Goods</h1>
        <Button onClick={handleAddGoods} className="flex items-center gap-1">
          <PlusCircle size={16} />
          <span>Add Goods</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading goods data...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={goods || []}
            searchColumn="name"
            searchPlaceholder="Search by name..."
          />
          {goods.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No goods found
            </div>
          )}
        </div>
      )}

      <CreateGoodsModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleGoodsCreated}
      />

      <UpdateGoodsModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleGoodsUpdated}
        goodsId={selectedGoodsId}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this goods item. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
