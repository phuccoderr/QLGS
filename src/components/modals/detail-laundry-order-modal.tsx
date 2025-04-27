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
import { getLaundryOrderById } from "@/api/laundry_order.api";
import { LaundryOrderResponse } from "@/types/laundry_order.type";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { ServiceResponse } from "@/types/service.type";
import { GoodsResponse } from "@/types/goods.type";
import { CustomerResponse } from "@/types/customer.type";
import { StaffResponse } from "@/types/staff.type";
import { StoreResponse } from "@/types/store.type";
import { getAllStaff } from "@/api/staff.api";
import { getAllCustomers } from "@/api/customer.api";
import { getAllStore } from "@/api/store.api";
import { getAllServices } from "@/api/service.api";
import { getAllGoods } from "@/api/goods.api";

interface DetailLaundryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export function DetailLaundryOrderModal({
  isOpen,
  onClose,
  orderId,
}: DetailLaundryOrderModalProps) {
  const [order, setOrder] = useState<LaundryOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [goods, setGoods] = useState<GoodsResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
      fetchSupportingData();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLaundryOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      // Fetch all supporting data in parallel
      const [servicesData, goodsData, customersData, staffData, storesData] =
        await Promise.all([
          getAllServices(),
          getAllGoods(),
          getAllCustomers(),
          getAllStaff(),
          getAllStore(),
        ]);

      setServices(servicesData);
      setGoods(goodsData);
      setCustomers(customersData);
      setStaff(staffData);
      setStores(storesData);
    } catch (error) {
      console.error("Error fetching supporting data:", error);
    }
  };

  // Helper functions to get names
  const getServiceName = (id: string) => {
    const service = services.find((s) => s._id === id);
    return service ? service.name : "Unknown";
  };

  const getGoodsName = (id?: string) => {
    if (!id) return "N/A";
    const item = goods.find((g) => g._id === id);
    return item ? item.name : "Unknown";
  };

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c._id === id);
    return customer ? customer.name : "Unknown";
  };

  const getStaffName = (id: string) => {
    const staffMember = staff.find((s) => s._id === id);
    return staffMember ? staffMember.name : "Unknown";
  };

  const getStoreName = (id: string) => {
    const store = stores.find((s) => s._id === id);
    return store ? store.name : "Unknown";
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Hoàn Thành":
        return "bg-green-100 text-green-800";
      case "Đang Xử Lý":
        return "bg-blue-100 text-blue-800";
      case "Đã Giao":
        return "bg-purple-100 text-purple-800";
      case "Đã Hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi Tiết Đơn Hàng Giặt Ủi</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về đơn hàng giặt ủi này.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải thông tin đơn hàng...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">
                Thông Tin Đơn Hàng
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Mã Đơn Hàng</p>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng Thái</p>
                  <p
                    className={`px-2 py-1 rounded-full text-xs inline-flex items-center w-fit ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cửa Hàng</p>
                  <p className="font-medium">{getStoreName(order.id_store)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách Hàng</p>
                  <p className="font-medium">
                    {getCustomerName(order.id_customer)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nhân Viên</p>
                  <p className="font-medium">{getStaffName(order.id_staff)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày Tạo</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày Nhận</p>
                  <p className="font-medium">
                    {formatDate(order.receivedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày Trả</p>
                  <p className="font-medium">
                    {formatDate(order.returnedDate)}
                  </p>
                </div>

                {order.pickupAddress && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Địa Chỉ Lấy Hàng
                    </p>
                    <p className="font-medium">{order.pickupAddress}</p>
                  </div>
                )}

                {order.deliveryAddress && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Địa Chỉ Giao Hàng
                    </p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">
                Chi Tiết Đơn Hàng
              </h3>
              {order.orderDetails.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Không có thông tin chi tiết đơn hàng
                </p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium">
                    <div className="col-span-3">Dịch Vụ</div>
                    <div className="col-span-3">Hàng Hóa</div>
                    <div className="col-span-1">SL</div>
                    <div className="col-span-2">Giá</div>
                    <div className="col-span-2">Tổng</div>
                    <div className="col-span-1">Ghi Chú</div>
                  </div>
                  <div className="divide-y">
                    {order.orderDetails.map((detail, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 p-3 text-sm"
                      >
                        <div className="col-span-3">
                          {getServiceName(detail.id_service)}
                        </div>
                        <div className="col-span-3">
                          {getGoodsName(detail.id_goods)}
                        </div>
                        <div className="col-span-1">{detail.quantity}</div>
                        <div className="col-span-2">
                          {formatCurrency(detail.price)}
                        </div>
                        <div className="col-span-2">
                          {formatCurrency(detail.subTotal)}
                        </div>
                        <div className="col-span-1">
                          {detail.note ? (
                            <span
                              className="text-xs text-gray-500 truncate"
                              title={detail.note}
                            >
                              {detail.note.length > 20
                                ? `${detail.note.substring(0, 20)}...`
                                : detail.note}
                            </span>
                          ) : (
                            "—"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">
                Thông Tin Thanh Toán
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng Tiền</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tiền Giảm Giá
                    </p>
                    <p className="font-medium text-lg">
                      {formatCurrency(order.discountAmount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Đã Thanh Toán</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(order.amountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Còn Lại</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(order.totalAmount - order.amountPaid)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Không có thông tin đơn hàng
          </p>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
