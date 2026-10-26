import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/integrations/firebase/auth";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
