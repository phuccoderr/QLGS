import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportResponse } from "@/types/report.type";
import { getReports } from "@/api/report.api";
import { getAllStore } from "@/api/store.api";
import { StoreResponse } from "@/types/store.type";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function Reports() {
  const [reportData, setReportData] = useState<ReportResponse[]>([]);
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "last_7_days" | "last_30_days" | "last_year"
  >("last_7_days");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load stores on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storeData = await getAllStore();
        setStores(storeData);
        if (storeData.length > 0) {
          setSelectedStore(storeData[0]._id);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu cửa hàng:", err);
        setError("Không thể tải dữ liệu cửa hàng");
      }
    };

    fetchStores();
  }, []);

  // Fetch report data when store or period changes
  useEffect(() => {
    if (selectedStore) {
      fetchReportData();
    }
  }, [selectedStore, selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(selectedPeriod, selectedStore);
      // Convert data to array if it's not already
      const dataArray = Array.isArray(data) ? data : [data];
      setReportData(dataArray);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", err);
      setError("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Prepare data for charts
  const chartData = reportData.map((item) => ({
    ...item,
    date: typeof item.date === "string" ? new Date(item.date) : item.date,
    formattedDate:
      typeof item.date === "string"
        ? format(new Date(item.date), "dd/MM/yyyy")
        : format(item.date, "dd/MM/yyyy"),
  }));

  // Calculate summary statistics
  const totalSales = chartData.reduce(
    (sum, item) => sum + (item.gross_sales || 0),
    0
  );
  const totalOrders = chartData.reduce(
    (sum, item) => sum + (item.orders_count || 0),
    0
  );
  const averageSalePerOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo Cáo Doanh Số</h1>
        <div className="flex space-x-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Chọn Cửa Hàng" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store._id} value={store._id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPeriod}
            onValueChange={(
              value: "last_7_days" | "last_30_days" | "last_year"
            ) => setSelectedPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn Thời Gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">7 Ngày Qua</SelectItem>
              <SelectItem value="last_30_days">30 Ngày Qua</SelectItem>
              <SelectItem value="last_year">Năm Vừa Qua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Doanh Thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "7 ngày qua"
                    : selectedPeriod === "last_30_days"
                    ? "30 ngày qua"
                    : "Năm vừa qua"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Đơn Hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "7 ngày qua"
                    : selectedPeriod === "last_30_days"
                    ? "30 ngày qua"
                    : "Năm vừa qua"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Giá Trị Trung Bình Mỗi Đơn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageSalePerOrder)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "7 ngày qua"
                    : selectedPeriod === "last_30_days"
                    ? "30 ngày qua"
                    : "Năm vừa qua"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Tabs */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Doanh Thu</TabsTrigger>
              <TabsTrigger value="orders">Đơn Hàng</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Xu Hướng Doanh Thu</CardTitle>
                  <CardDescription>
                    Doanh thu theo thời gian của{" "}
                    {stores.find((s) => s._id === selectedStore)?.name ||
                      "cửa hàng đã chọn"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 50,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="formattedDate"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                              notation: "compact",
                              compactDisplay: "short",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value as number),
                            "Doanh Thu",
                          ]}
                          labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="gross_sales"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Doanh Thu"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Số Lượng Đơn Hàng</CardTitle>
                  <CardDescription>
                    Số đơn hàng theo thời gian của{" "}
                    {stores.find((s) => s._id === selectedStore)?.name ||
                      "cửa hàng đã chọn"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 50,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="formattedDate"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value}`, "Đơn Hàng"]}
                          labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Legend />
                        <Bar
                          dataKey="orders_count"
                          fill="#82ca9d"
                          name="Đơn Hàng"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
