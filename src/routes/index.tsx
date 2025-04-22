import { createBrowserRouter, Navigate } from "react-router-dom";
import Customers from "@/pages/Customers";
import Services from "@/pages/Services";
import Promotions from "@/pages/Promotions";
import MemberShipCards from "@/pages/MemberShipCards";
import MainLayout from "@/layouts/MainLayout";
import Store from "@/pages/Store";
import Staff from "@/pages/Staff";
import Goods from "@/pages/Goods";
import Warehouse from "@/pages/Warehouse";
import Supplier from "@/pages/Supplier";
import StockTransactions from "@/pages/StockTransactions";
import LaundryOrder from "@/pages/LaundryOrder";
import Invoice from "@/pages/Invoice";
import Delivery from "@/pages/Delivery";
import Login from "@/pages/Login";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        element: <Customers />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/promotions",
        element: <Promotions />,
      },
      {
        path: "/membership-cards",
        element: <MemberShipCards />,
      },
      {
        path: "/store",
        element: <Store />,
      },
      {
        path: "/staff",
        element: <Staff />,
      },
      {
        path: "/goods",
        element: <Goods />,
      },
      {
        path: "/warehouse",
        element: <Warehouse />,
      },
      {
        path: "/supplier",
        element: <Supplier />,
      },
      {
        path: "/stock-transactions",
        element: <StockTransactions />,
      },
      {
        path: "/laundry-orders",
        element: <LaundryOrder />,
      },
      {
        path: "/invoices",
        element: <Invoice />,
      },
      {
        path: "/deliveries",
        element: <Delivery />,
      },
    ],
  },
]);
