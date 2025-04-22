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
import { createLaundryOrder } from "@/api/laundry_order.api";
import {
  CreateLaundryOrderRequestType,
  OrderDetailDto,
} from "@/types/laundry_order.type";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ServiceResponse } from "@/types/service.type";
import { GoodsResponse } from "@/types/goods.type";
import { CustomerResponse } from "@/types/customer.type";
import { StaffResponse } from "@/types/staff.type";
import { StoreResponse } from "@/types/store.type";
import { PromotionResponse } from "@/types/promotion.type";
import { getAllCustomers } from "@/api/customer.api";
import { getAllStaff } from "@/api/staff.api";
import { getAllStore } from "@/api/store.api";
import { getAllPromotions } from "@/api/promotion.api";
import { PlusCircle, Trash } from "lucide-react";
import { format } from "date-fns";

interface CreateLaundryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  services: ServiceResponse[];
  goods: GoodsResponse[];
}

export function CreateLaundryOrderModal({
  isOpen,
  onClose,
  onSuccess,
  services,
  goods,
}: CreateLaundryOrderModalProps) {
  const [formData, setFormData] = useState<CreateLaundryOrderRequestType>({
    id_store: "",
    id_customer: "",
    id_staff: "",
    receivedDate: new Date().toISOString(),
    returnedDate: undefined,
    pickupAddress: "",
    deliveryAddress: "",
    totalAmount: 0,
    discountAmount: 0,
    amountPaid: 0,
    status: "Pending",
    promotionId: undefined,
    orderDetails: [],
  });

  const [orderDetail, setOrderDetail] = useState<OrderDetailDto>({
    id_service: "",
    id_goods: undefined,
    quantity: 1,
    price: 0,
    subTotal: 0,
    note: "",
  });

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchStaff();
      fetchStores();
      fetchPromotions();
    }
  }, [isOpen]);

  // When service changes, update the price based on the service selected
  useEffect(() => {
    if (orderDetail.id_service) {
      const selectedService = services.find(
        (s) => s._id === orderDetail.id_service
      );
      if (selectedService) {
        // Set price from service
        const newPrice = selectedService.price;
        setOrderDetail((prev) => ({
          ...prev,
          price: newPrice,
          subTotal: newPrice * prev.quantity,
        }));
      }
    }
  }, [orderDetail.id_service, services]);

  // Calculate subtotal when quantity or price changes
  useEffect(() => {
    const subtotal = orderDetail.price * orderDetail.quantity;
    setOrderDetail((prev) => ({
      ...prev,
      subTotal: subtotal,
    }));
  }, [orderDetail.price, orderDetail.quantity]);

  // Calculate total amount when order details change
  useEffect(() => {
    const total = formData.orderDetails.reduce(
      (sum, detail) => sum + detail.subTotal,
      0
    );
    let finalTotal = total;

    // Apply discount if promotion is selected
    if (formData.promotionId) {
      const selectedPromotion = promotions.find(
        (promo) => promo._id === formData.promotionId
      );
      if (selectedPromotion) {
        let discount = 0;
        if (selectedPromotion.type === "Percentage") {
          discount = total * (selectedPromotion.value / 100);
        } else if (selectedPromotion.type === "Cash") {
          discount = selectedPromotion.value;
        }

        setFormData((prev) => ({
          ...prev,
          discountAmount: discount,
          totalAmount: total - discount,
          amountPaid: total - discount,
        }));
        finalTotal = total - discount;
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        discountAmount: 0,
        totalAmount: total,
        amountPaid: total,
      }));
    }
  }, [formData.orderDetails, formData.promotionId, promotions]);

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
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

  const fetchPromotions = async () => {
    try {
      const data = await getAllPromotions();

      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const handleOrderDetailChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const quantityValue = parseInt(value);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        setQuantityError("Quantity must be a positive number");
      } else {
        setQuantityError("");
      }
      setOrderDetail((prev) => ({
        ...prev,
        [name]: quantityValue,
      }));
    } else if (name === "price") {
      const priceValue = parseFloat(value);
      if (isNaN(priceValue) || priceValue <= 0) {
        setPriceError("Price must be a positive number");
      } else {
        setPriceError("");
      }
      setOrderDetail((prev) => ({
        ...prev,
        [name]: priceValue,
      }));
    } else {
      setOrderDetail((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrderDetail = () => {
    // Validate order detail
    if (!orderDetail.id_service) {
      setError("Service is required for order detail");
      return;
    }

    if (quantityError || priceError) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      orderDetails: [...prev.orderDetails, { ...orderDetail }],
    }));

    // Reset order detail form
    setOrderDetail({
      id_service: "",
      id_goods: undefined,
      quantity: 1,
      price: 0,
      subTotal: 0,
      note: "",
    });
    setError("");
  };

  const handleRemoveOrderDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      orderDetails: prev.orderDetails.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.id_store) {
      setError("Store is required");
      return;
    }

    if (!formData.id_customer) {
      setError("Customer is required");
      return;
    }

    if (!formData.id_staff) {
      setError("Staff is required");
      return;
    }

    if (!formData.receivedDate) {
      setError("Received date is required");
      return;
    }

    if (formData.orderDetails.length === 0) {
      setError("At least one service is required");
      return;
    }

    if (formData.amountPaid <= 0) {
      setError("Amount paid must be greater than zero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createLaundryOrder(formData);
      setLoading(false);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        id_store: "",
        id_customer: "",
        id_staff: "",
        receivedDate: new Date().toISOString(),
        returnedDate: undefined,
        pickupAddress: "",
        deliveryAddress: "",
        totalAmount: 0,
        discountAmount: 0,
        amountPaid: 0,
        status: "Pending",
        promotionId: undefined,
        orderDetails: [],
      });
      toast.success("Laundry order created successfully!");
    } catch (error) {
      console.error("Error creating laundry order:", error);
      setError("Failed to create laundry order. Please try again.");
      setLoading(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Laundry Order</DialogTitle>
            <DialogDescription>
              Enter the details for the new laundry order. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <h3 className="font-medium">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_store">Store</Label>
                <select
                  id="id_store"
                  name="id_store"
                  value={formData.id_store}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_customer">Customer</Label>
                <select
                  id="id_customer"
                  name="id_customer"
                  value={formData.id_customer}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_staff">Staff</Label>
                <select
                  id="id_staff"
                  name="id_staff"
                  value={formData.id_staff}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select staff</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivedDate">Received Date</Label>
                <Input
                  id="receivedDate"
                  name="receivedDate"
                  type="date"
                  value={
                    formData.receivedDate
                      ? format(new Date(formData.receivedDate), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : new Date();
                    setFormData((prev) => ({
                      ...prev,
                      receivedDate: date.toISOString(),
                    }));
                  }}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnedDate">Expected Return Date</Label>
                <Input
                  id="returnedDate"
                  name="returnedDate"
                  type="date"
                  value={
                    formData.returnedDate
                      ? format(new Date(formData.returnedDate), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    setFormData((prev) => ({
                      ...prev,
                      returnedDate: date ? date.toISOString() : undefined,
                    }));
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotionId">Promotion</Label>
                <select
                  id="promotionId"
                  name="promotionId"
                  value={formData.promotionId || ""}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No promotion</option>
                  {promotions.map((promo) => (
                    <option key={promo._id} value={promo._id}>
                      {promo.name} -{" "}
                      {promo.type === "Percentage"
                        ? `${promo.value}%`
                        : formatCurrency(promo.value)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address (optional)</Label>
                <Input
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">
                  Delivery Address (optional)
                </Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Order Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleAddOrderDetail}
                  disabled={
                    !orderDetail.id_service || !!quantityError || !!priceError
                  }
                >
                  <PlusCircle size={16} />
                  <span>Add Service</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="id_service">Service</Label>
                  <select
                    id="id_service"
                    name="id_service"
                    value={orderDetail.id_service}
                    onChange={handleOrderDetailChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name} ({formatCurrency(service.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_goods">Goods (optional)</Label>
                  <select
                    id="id_goods"
                    name="id_goods"
                    value={orderDetail.id_goods || ""}
                    onChange={handleOrderDetailChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">None</option>
                    {goods.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={orderDetail.quantity || ""}
                    onChange={handleOrderDetailChange}
                    className={quantityError ? "border-destructive" : ""}
                  />
                  {quantityError && (
                    <p className="text-xs text-destructive">{quantityError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="1000"
                    min="0"
                    value={orderDetail.price || ""}
                    onChange={handleOrderDetailChange}
                    className={priceError ? "border-destructive" : ""}
                  />
                  {priceError && (
                    <p className="text-xs text-destructive">{priceError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subTotal">Subtotal</Label>
                  <div>
                    <Input
                      id="subTotal"
                      name="subTotal"
                      value={orderDetail.subTotal || ""}
                      className="bg-muted"
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(orderDetail.subTotal)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Notes (optional)</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={orderDetail.note || ""}
                    onChange={handleOrderDetailChange}
                    rows={1}
                  />
                </div>
              </div>

              {/* Added services table */}
              {formData.orderDetails.length > 0 && (
                <div className="border rounded-md mt-4">
                  <div className="grid grid-cols-12 gap-2 p-2 font-medium bg-muted text-sm">
                    <div className="col-span-3">Service</div>
                    <div className="col-span-2">Goods</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Subtotal</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  <div className="divide-y">
                    {formData.orderDetails.map((detail, index) => {
                      const serviceName =
                        services.find((s) => s._id === detail.id_service)
                          ?.name || "Unknown";
                      const goodsName = detail.id_goods
                        ? goods.find((g) => g._id === detail.id_goods)?.name ||
                          "Unknown"
                        : "N/A";

                      return (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 p-2 text-sm items-center"
                        >
                          <div
                            className="col-span-3 truncate"
                            title={serviceName}
                          >
                            {serviceName}
                          </div>
                          <div
                            className="col-span-2 truncate"
                            title={goodsName}
                          >
                            {goodsName}
                          </div>
                          <div className="col-span-1">{detail.quantity}</div>
                          <div className="col-span-2">
                            {formatCurrency(detail.price)}
                          </div>
                          <div className="col-span-2">
                            {formatCurrency(detail.subTotal)}
                          </div>
                          <div className="col-span-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOrderDetail(index)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium mb-4">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    value={formData.totalAmount || 0}
                    className="bg-muted"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.totalAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Discount Amount</Label>
                  <Input
                    id="discountAmount"
                    name="discountAmount"
                    value={formData.discountAmount || 0}
                    className="bg-muted"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.discountAmount || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid</Label>
                  <Input
                    id="amountPaid"
                    name="amountPaid"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.amountPaid || 0}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(formData.amountPaid || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                formData.orderDetails.length === 0 ||
                !formData.id_store ||
                !formData.id_customer ||
                !formData.id_staff
              }
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
