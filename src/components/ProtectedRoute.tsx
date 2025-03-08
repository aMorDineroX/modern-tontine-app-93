
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", { user, loading, session });
  }, [user, loading, session]);

  // Show loading state if still checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tontine-purple"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user && !session) {
    console.log("User not authenticated, redirecting to /signin");
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // Render children routes if authenticated
  console.log("User authenticated, rendering protected route");
  return <Outlet />;
}
