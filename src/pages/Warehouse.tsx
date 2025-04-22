import { useState, useEffect } from "react";
import { WarehouseResponse } from "@/types/warehouse.type";
import {
  getAllWarehouse,
  deleteWarehouse,
  updateWarehouse,
} from "@/api/warehouse.api";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Trash,
  Truck,
  MinusCircle,
  PlusIcon,
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
import { Badge } from "@/components/ui/badge";
import { getAllGoods } from "@/api/goods.api";
import { getAllStore } from "@/api/store.api";
import { GoodsResponse } from "@/types/goods.type";
import { StoreResponse } from "@/types/store.type";
import { CreateWarehouseModal } from "@/components/modals/create-warehouse-modal";
import { UpdateWarehouseModal } from "@/components/modals/update-warehouse-modal";

export default function Warehouse() {
  const [warehouse, setWarehouse] = useState<WarehouseResponse[]>([]);
  const [goods, setGoods] = useState<GoodsResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quantityUpdateLoading, setQuantityUpdateLoading] = useState(false);

  // Load all required data when component mounts
  useEffect(() => {
    fetchWarehouse();
    fetchGoods();
    fetchStores();
  }, []);

  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const data = await getAllWarehouse();
      setWarehouse(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
      setLoading(false);
      toast.error("Failed to load warehouse data");
    }
  };

  const fetchGoods = async () => {
    try {
      const data = await getAllGoods();
      setGoods(data);
    } catch (error) {
      console.error("Error fetching goods data:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };

  const handleAddWarehouse = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditWarehouse = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateQuantity = async (
    warehouseId: string,
    currentQuantity: number,
    increment: boolean
  ) => {
    setQuantityUpdateLoading(true);
    const newQuantity = increment
      ? currentQuantity + 1
      : Math.max(0, currentQuantity - 1);
    try {
      await updateWarehouse(warehouseId, { quantity: newQuantity });
      toast.success(`Quantity updated to ${newQuantity}`);
      fetchWarehouse();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
    setQuantityUpdateLoading(false);
  };

  const confirmDelete = async () => {
    if (!selectedWarehouseId) return;

    setDeleteLoading(true);
    try {
      await deleteWarehouse(selectedWarehouseId);
      fetchWarehouse();
      setIsDeleteDialogOpen(false);
      setSelectedWarehouseId(null);
      toast.success("Warehouse record deleted successfully");
    } catch (error) {
      console.error("Error deleting warehouse record:", error);
      toast.error("Failed to delete warehouse record");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedWarehouseId(null);
  };

  const handleWarehouseCreated = () => {
    fetchWarehouse();
  };

  const handleWarehouseUpdated = () => {
    fetchWarehouse();
  };

  // Get store name by ID
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Unknown Store";
  };

  // Get goods name by ID
  const getGoodsName = (goodsId: string) => {
    const goodsItem = goods.find((g) => g._id === goodsId);
    return goodsItem ? goodsItem.name : "Unknown Item";
  };

  // Define columns for warehouse table
  const columns: ColumnDef<WarehouseResponse>[] = [
    {
      accessorKey: "id_store",
      header: "Store",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      accessorKey: "id_goods",
      header: "Goods",
      cell: ({ row }) => {
        const goodsId = row.getValue("id_goods") as string;
        return getGoodsName(goodsId);
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number;
        return (
          <div className="flex items-center space-x-2">
            <span>{quantity}</span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  handleUpdateQuantity(row.original._id, quantity, false)
                }
                disabled={quantityUpdateLoading || quantity <= 0}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  handleUpdateQuantity(row.original._id, quantity, true)
                }
                disabled={quantityUpdateLoading}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <Badge variant={status ? "default" : "destructive"}>
            {status ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const warehouse = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditWarehouse(warehouse._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteWarehouse(warehouse._id)}
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
        <h1 className="text-2xl font-bold">Warehouse</h1>
        <Button
          onClick={handleAddWarehouse}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>Add Warehouse Record</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading warehouse data...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={warehouse || []}
            searchColumn="id_goods"
            searchPlaceholder="Search by goods ID..."
          />
          {warehouse.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No warehouse records found
            </div>
          )}
        </div>
      )}

      <CreateWarehouseModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleWarehouseCreated}
        goods={goods}
        stores={stores}
      />

      <UpdateWarehouseModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleWarehouseUpdated}
        warehouseId={selectedWarehouseId || ""}
        goods={goods}
        stores={stores}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this warehouse record. This
              action cannot be undone.
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
