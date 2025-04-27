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
import { CreateStockTransactionModal } from "@/components/modals/create-stock-transaction-modal";
import { UpdateStockTransactionModal } from "@/components/modals/update-stock-transaction-modal";

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
      console.log(data);
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu giao dịch kho:", error);
      toast.error("Không thể tải dữ liệu giao dịch kho");
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getAllStore();
      setStores(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
    }
  };

  const fetchGoods = async () => {
    try {
      const data = await getAllGoods();
      setGoods(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu hàng hóa:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhà cung cấp:", error);
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
      toast.success("Đã xóa giao dịch kho thành công");
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch kho:", error);
      toast.error("Không thể xóa giao dịch kho");
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
    return store ? store.name : "Cửa hàng không xác định";
  };

  const getGoodsName = (goodsId: string) => {
    const item = goods.find((g) => g._id === goodsId);
    return item ? item.name : "Hàng hóa không xác định";
  };

  const getSupplierName = (supplierId: string) => {
    if (!supplierId) return "N/A";
    const supplier = suppliers.find((s) => s._id === supplierId);
    return supplier ? supplier.name : "Nhà cung cấp không xác định";
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
      return "Ngày không hợp lệ";
    }
  };

  // Define columns for transaction table
  const columns: ColumnDef<StockTransactionResponse>[] = [
    {
      accessorKey: "id_goods",
      header: "Hàng Hóa",
      cell: ({ row }) => {
        const goodsId = row.getValue("id_goods") as string;
        return getGoodsName(goodsId);
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
      accessorKey: "id_supplier",
      header: "Nhà Cung Cấp",
      cell: ({ row }) => {
        const supplierId = row.getValue("id_supplier") as string;
        return getSupplierName(supplierId);
      },
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => {
        const type = row.getValue("type") as "Nhap" | "Xuat";
        return (
          <Badge variant={type === "Nhap" ? "default" : "destructive"}>
            {type === "Nhap" ? "Nhập" : "Xuất"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Số Lượng",
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return formatCurrency(price);
      },
    },
    {
      accessorKey: "date",
      header: "Ngày",
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return formatDate(date);
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEditTransaction(transaction._id)}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteTransaction(transaction._id)}
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
        <h1 className="text-2xl font-bold">Giao Dịch Kho</h1>
        <Button
          onClick={handleAddTransaction}
          className="flex items-center gap-1"
        >
          <PlusCircle size={16} />
          <span>Thêm Giao Dịch</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu giao dịch kho...</p>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={transactions || []}
            searchColumn="id_goods"
            searchPlaceholder="Tìm kiếm theo mã hàng hóa..."
          />
          {transactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Không tìm thấy giao dịch kho
            </div>
          )}
        </div>
      )}

      <CreateStockTransactionModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleTransactionCreated}
      />

      <UpdateStockTransactionModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleTransactionUpdated}
        transactionId={selectedTransactionId || ""}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn bản
              ghi giao dịch kho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTransactionId(null);
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
