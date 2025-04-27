import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/admin.api";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!email.trim()) {
      setError("Email là bắt buộc");
      return;
    }

    if (!password.trim()) {
      setError("Mật khẩu là bắt buộc");
      return;
    }

    // Simple email validation
    if (!isValidEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({ email, password });

      // Store token in localStorage
      localStorage.setItem("token", response.token);

      toast.success("Đăng nhập thành công!");

      // Redirect to the page the user was trying to access before being redirected to login
      // or to the home page if there's no saved location
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);

      // Display error message
      if (error.response?.status === 401) {
        setError("Email hoặc mật khẩu không đúng");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }

      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Đăng Nhập Admin</h1>
          <p className="text-muted-foreground mt-2">
            Nhập thông tin đăng nhập để truy cập trang quản trị
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={
                error && error.includes("email")
                  ? "border-destructive ring-destructive"
                  : ""
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={
                error && error.includes("password")
                  ? "border-destructive ring-destructive"
                  : ""
              }
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
