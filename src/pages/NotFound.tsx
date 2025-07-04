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
      <div className="text-center p-8 bg-background/50 backdrop-blur-lg border border-primary/20 rounded-lg shadow-lg shadow-primary/20">
        <h1 className="text-9xl font-bold text-primary" style={{ textShadow: '0 0 12px hsl(var(--primary))' }}>404</h1>
        <p className="text-2xl text-foreground mt-4 mb-8">Oops! Page not found</p>
        <Link to="/" className="text-primary hover:text-accent underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;