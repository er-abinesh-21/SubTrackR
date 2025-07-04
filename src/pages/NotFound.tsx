import { Link } from "react-router-dom";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <Frown className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground mt-4 mb-8">Oops! Page not found.</p>
        <Button asChild>
          <Link to="/dashboard">
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;