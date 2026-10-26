import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/integrations/firebase/auth";
import { BrandLoader } from "@/components/Logo";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <BrandLoader className="min-h-screen" />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
