import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UpdateStockTransactionRequestType,
  StockTransactionResponse,
} from "@/types/stock-transaction.type";
import { toast } from "sonner";
import { getAllGoods } from "@/api/goods.api";
import { getAllStore } from "@/api/store.api";
import { getAllSuppliers } from "@/api/supplier.api";
import {
  getStockTransactionById,
  updateStockTransaction,
} from "@/api/stock-transaction.api";

interface UpdateStockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionId: string;
}

export function UpdateStockTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionId,
}: UpdateStockTransactionModalProps) {
  const [formData, setFormData] = useState<UpdateStockTransactionRequestType>({
    id_goods: "",
    id_store: "",
    id_supplier: "",
    type: "Nhap",
    quantity: 0,
    price: 0,
    date: new Date(),
  });

  const [originalTransaction, setOriginalTransaction] =
    useState<StockTransactionResponse | null>(null);
  const [goods, setGoods] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch reference data and transaction data
  useEffect(() => {
    if (isOpen && transactionId) {
      fetchReferenceData();
      fetchTransactionData();
    }
  }, [isOpen, transactionId]);

  const fetchReferenceData = async () => {
    setDataLoading(true);
    try {
      const [goodsData, storesData, suppliersData] = await Promise.all([
        getAllGoods(),
        getAllStore(),
        getAllSuppliers(),
      ]);
      setGoods(goodsData);
      setStores(storesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tham chiếu:", error);
      setError("Không thể tải dữ liệu tham chiếu. Vui lòng thử lại.");
    }
    setDataLoading(false);
  };

  const fetchTransactionData = async () => {
    if (!transactionId) return;

    setFetchLoading(true);
    try {
      const data = await getStockTransactionById(transactionId);
      setOriginalTransaction(data);

      // Initialize form with existing data
      setFormData({
        id_goods: data.id_goods,
        id_store: data.id_store,
        id_supplier: data.id_supplier || "",
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        date: new Date(data.date),
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu giao dịch:", error);
      setError("Không thể tải dữ liệu giao dịch. Vui lòng thử lại.");
      onClose(); // Close modal on error
    }
    setFetchLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : name === "date"
          ? new Date(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before submission
    let hasError = false;

    if (formData.type === "Nhap" && formData.id_supplier === "") {
      setError("Vui lòng chọn nhà cung cấp cho giao dịch nhập kho");
      hasError = true;
    } else if (formData.quantity !== undefined && formData.quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      hasError = true;
    } else if (formData.price !== undefined && formData.price < 0) {
      setError("Giá không thể âm");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create a clean update object with only changed fields
      const updateData: UpdateStockTransactionRequestType = {};

      // Only include fields that have changed
      if (formData.id_goods !== originalTransaction?.id_goods) {
        updateData.id_goods = formData.id_goods;
      }

      if (formData.id_store !== originalTransaction?.id_store) {
        updateData.id_store = formData.id_store;
      }

      // Handle supplier field specially
      if (formData.type === "Xuat") {
        // For outgoing transactions, supplier is optional
        if (
          formData.id_supplier &&
          formData.id_supplier !== originalTransaction?.id_supplier
        ) {
          updateData.id_supplier = formData.id_supplier;
        }
      } else {
        // For incoming transactions, supplier is required
        if (formData.id_supplier !== originalTransaction?.id_supplier) {
          updateData.id_supplier = formData.id_supplier;
        }
      }

      if (formData.type !== originalTransaction?.type) {
        updateData.type = formData.type;
      }

      if (formData.quantity !== originalTransaction?.quantity) {
        updateData.quantity = formData.quantity;
      }

      if (formData.price !== originalTransaction?.price) {
        updateData.price = formData.price;
      }

      if (
        formData.date?.toISOString() !==
        new Date(originalTransaction?.date || "").toISOString()
      ) {
        updateData.date = formData.date;
      }

      await updateStockTransaction(transactionId, updateData);
      setLoading(false);
      onSuccess();
      onClose();
      toast.success("Cập nhật giao dịch kho thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật giao dịch kho:", error);
      setError("Không thể cập nhật giao dịch kho. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        {fetchLoading ? (
          <div className="p-6 text-center">Đang tải dữ liệu giao dịch...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Cập Nhật Giao Dịch Kho</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin cho giao dịch kho này. Nhấn lưu khi hoàn tất.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Loại Giao Dịch
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Nhap">Nhập Kho</option>
                  <option value="Xuat">Xuất Kho</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_goods" className="text-right">
                  Hàng Hóa
                </Label>
                <select
                  id="id_goods"
                  name="id_goods"
                  value={formData.id_goods}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={dataLoading}
                  required
                >
                  <option value="">Chọn Hàng Hóa</option>
                  {goods.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id_store" className="text-right">
                  Cửa Hàng
                </Label>
                <select
                  id="id_store"
                  name="id_store"
                  value={formData.id_store}
                  onChange={handleChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={dataLoading}
                  required
                >
                  <option value="">Chọn Cửa Hàng</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.type === "Nhap" || formData.id_supplier) && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id_supplier" className="text-right">
                    Nhà Cung Cấp
                  </Label>
                  <select
                    id="id_supplier"
                    name="id_supplier"
                    value={formData.id_supplier}
                    onChange={handleChange}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={dataLoading}
                    required={formData.type === "Nhap"}
                  >
                    <option value="">Chọn Nhà Cung Cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Số Lượng
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Giá
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Ngày Giao Dịch
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date?.toISOString().split("T")[0] || ""}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading || fetchLoading}>
                {loading ? "Đang Cập Nhật..." : "Cập Nhật Giao Dịch"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
