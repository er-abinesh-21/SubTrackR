import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center dark">
      <div className="text-center p-8 bg-background/50 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-lg shadow-primary/20">
        <h1 className="text-6xl font-bold text-primary" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>404</h1>
        <p className="text-xl text-muted-foreground mt-4 mb-6">Oops! Page not found</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline" style={{ textShadow: '0 0 5px hsl(var(--primary))' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;