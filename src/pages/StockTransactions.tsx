import { useState, useEffect } from "react";
import { StockTransactionResponse } from "@/types/stock-transaction.type";
import {
  getAllStockTransactions,
  deleteStockTransaction,
} from "@/api/stock-transaction.api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, ReceiptText } from "lucide-react";
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
import { getAllGoods } from "@/api/goods.api";
import { getAllSuppliers } from "@/api/supplier.api";
import { StoreResponse } from "@/types/store.type";
import { GoodsResponse } from "@/types/goods.type";
import { SupplierResponse } from "@/types/supplier.type";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function StockTransactions() {
  const [transactions, setTransactions] = useState<StockTransactionResponse[]>(
    []
  );
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [goods, setGoods] = useState<GoodsResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchStores();
    fetchGoods();
    fetchSuppliers();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllStockTransactions();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stock transactions:", error);
      toast.error("Failed to load stock transactions");
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchGoods = async () => {
    try {
      const data = await getAllGoods();
      setGoods(data);
    } catch (error) {
      console.error("Error fetching goods:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleAddTransaction = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTransactionId) return;

    setDeleteLoading(true);
    try {
      await deleteStockTransaction(selectedTransactionId);
      fetchTransactions();
      setIsDeleteDialogOpen(false);
      setSelectedTransactionId(null);
      toast.success("Stock transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting stock transaction:", error);
      toast.error("Failed to delete stock transaction");
    }
    setDeleteLoading(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleTransactionCreated = () => {
    fetchTransactions();
  };

  const handleTransactionUpdated = () => {
    fetchTransactions();
  };

  // Helper functions to get names by IDs
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s._id === storeId);
    return store ? store.name : "Unknown Store";
  };

  const getGoodsName = (goodsId: string) => {
    const item = goods.find((g) => g._id === goodsId);
    return item ? item.name : "Unknown Item";
  };

  const getSupplierName = (supplierId: string) => {
    if (!supplierId) return "N/A";
    const supplier = suppliers.find((s) => s._id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };

  // Format price as currency
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format date
  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Define columns for transaction table
  const columns: ColumnDef<StockTransactionResponse>[] = [
    {
      accessorKey: "id_goods",
      header: "Goods",
      cell: ({ row }) => {
        const goodsId = row.getValue("id_goods") as string;
        return getGoodsName(goodsId);
      },
    },
    {
      accessorKey: "id_store",
      header: "Store",
      cell: ({ row }) => {
        const storeId = row.getValue("id_store") as string;
        return getStoreName(storeId);
      },
    },
    {
      accessorKey: "id_supplier",
      header: "Supplier",
      cell: ({ row }) => {
        const supplierId = row.getValue("id_supplier") as string;
        return getSupplierName(supplierId);
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as "Nhap" | "Xuat";
        return (
          <Badge variant={type === "Nhap" ? "default" : "destructive"}>
            {type === "Nhap" ? "Import" : "Export"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return formatCurrency(price);
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return formatDate(date);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditTransaction(transaction._id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteTransaction(transaction._id)}
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
        <h1 className="text-2xl font-bold">Stock Transactions</h1>
        <Button
          onClick={handleAddTransaction}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>Add Transaction</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading stock transactions...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={transactions || []}
            searchColumn="id_goods"
            searchPlaceholder="Search by goods ID..."
          />
          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No stock transactions found
            </div>
          )}
        </div>
      )}

      {/* TODO: Implement CreateStockTransactionModal component */}
      {/* <CreateStockTransactionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleTransactionCreated}
        stores={stores}
        goods={goods}
        suppliers={suppliers}
      /> */}

      {/* TODO: Implement UpdateStockTransactionModal component */}
      {/* <UpdateStockTransactionModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleTransactionUpdated}
        transactionId={selectedTransactionId || ""}
        stores={stores}
        goods={goods}
        suppliers={suppliers}
      /> */}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              stock transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTransactionId(null);
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
