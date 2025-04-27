import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/api/admin.api";
import { toast } from "sonner";

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This will remove the token from localStorage
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b md:block hidden">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-lg font-medium">DH21KPM02</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:py-8">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
