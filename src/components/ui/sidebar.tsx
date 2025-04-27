import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  MenuIcon,
  XIcon,
  Users,
  Package,
  Percent,
  CreditCard,
  UserCog,
  UserCircle,
  ShoppingBasket,
  Warehouse,
  TruckIcon,
  ClipboardList,
  Shirt,
  Receipt,
  Truck,
  LayoutDashboard,
  BarChart,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: BarChart, label: "Thống kê", path: "/dashboard" },
    { icon: Users, label: "Khách hàng", path: "/customers" },
    { icon: Package, label: "Dịch vụ", path: "/services" },
    { icon: Percent, label: "Khuyến mãi", path: "/promotions" },
    { icon: CreditCard, label: "Thẻ thành viên", path: "/membership-cards" },
    { icon: ShoppingBasket, label: "Hàng hoá", path: "/goods" },
    { icon: Warehouse, label: "Nhà kho", path: "/warehouse" },
    { icon: TruckIcon, label: "Nhà cung cấp", path: "/supplier" },
    {
      icon: ClipboardList,
      label: "Giao dịch chứng khoán",
      path: "/stock-transactions",
    },
    { icon: Shirt, label: "Đơn hàng giặt", path: "/laundry-orders" },
    { icon: Receipt, label: "Hoá đơn", path: "/invoices" },
    { icon: Truck, label: "Giao hàng", path: "/deliveries" },
    { icon: UserCog, label: "Cửa hàng", path: "/store" },
    { icon: UserCircle, label: "Nhân viên", path: "/staff" },
  ];

  // Desktop sidebar
  const DesktopSidebar = (
    <aside
      className={cn(
        "bg-muted border-r transition-all duration-300 flex flex-col h-screen hidden md:flex",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && (
          <h2 className="font-semibold text-lg">Ứng Dụng Của Tôi</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <MenuIcon size={18} /> : <XIcon size={18} />}
        </Button>
      </div>
      <SidebarContent collapsed={collapsed} />
    </aside>
  );

  // Mobile sidebar (uses Sheet component)
  const MobileSidebar = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon" className="mt-4 ml-4">
          <MenuIcon size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[240px]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Ứng Dụng Của Tôi</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <XIcon size={18} />
          </Button>
        </div>
        <SidebarContent collapsed={false} onClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );

  // Shared content between desktop and mobile
  function SidebarContent({
    collapsed,
    onClick,
  }: {
    collapsed: boolean;
    onClick?: () => void;
  }) {
    return (
      <>
        <nav className="flex-1 overflow-auto p-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-secondary",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    onClick={onClick}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              © 2024 Ứng Dụng Của Tôi
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
}
