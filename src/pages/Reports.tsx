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
        console.error("Error fetching stores:", err);
        setError("Failed to load stores");
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
      console.error("Error fetching report data:", err);
      setError("Failed to load report data");
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
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <div className="flex space-x-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Store" />
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
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
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
          <p>Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "Last 7 days"
                    : selectedPeriod === "last_30_days"
                    ? "Last 30 days"
                    : "Last year"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "Last 7 days"
                    : selectedPeriod === "last_30_days"
                    ? "Last 30 days"
                    : "Last year"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageSalePerOrder)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === "last_7_days"
                    ? "Last 7 days"
                    : selectedPeriod === "last_30_days"
                    ? "Last 30 days"
                    : "Last year"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Tabs */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>
                    Gross sales over time for{" "}
                    {stores.find((s) => s._id === selectedStore)?.name ||
                      "selected store"}
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
                            "Sales",
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="gross_sales"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Sales"
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
                  <CardTitle>Orders Count</CardTitle>
                  <CardDescription>
                    Number of orders over time for{" "}
                    {stores.find((s) => s._id === selectedStore)?.name ||
                      "selected store"}
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
                          formatter={(value) => [`${value}`, "Orders"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Bar
                          dataKey="orders_count"
                          fill="#82ca9d"
                          name="Orders"
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
