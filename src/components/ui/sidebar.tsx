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
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: Package, label: "Services", path: "/services" },
    { icon: Percent, label: "Promotions", path: "/promotions" },
    { icon: CreditCard, label: "Membership Cards", path: "/membership-cards" },
    { icon: ShoppingBasket, label: "Goods", path: "/goods" },
    { icon: Warehouse, label: "Warehouse", path: "/warehouse" },
    { icon: TruckIcon, label: "Supplier", path: "/supplier" },
    {
      icon: ClipboardList,
      label: "Stock Transactions",
      path: "/stock-transactions",
    },
    { icon: Shirt, label: "Laundry Orders", path: "/laundry-orders" },
    { icon: Receipt, label: "Invoices", path: "/invoices" },
    { icon: Truck, label: "Deliveries", path: "/deliveries" },
    { icon: UserCog, label: "Store", path: "/store" },
    { icon: UserCircle, label: "Staff", path: "/staff" },
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
        {!collapsed && <h2 className="font-semibold text-lg">My App</h2>}
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
          <h2 className="font-semibold text-lg">My App</h2>
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
            <div className="text-xs text-muted-foreground">© 2024 My App</div>
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
