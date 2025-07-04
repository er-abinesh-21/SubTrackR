import { Link } from "react-router-dom";
import { Frown } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center dark">
      <div className="text-center p-8 bg-background/50 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-lg shadow-primary/20">
        <Frown className="mx-auto h-24 w-24 text-primary/50 mb-6" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }} />
        <h1 className="text-6xl font-bold text-primary" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>404</h1>
        <p className="text-xl text-muted-foreground mt-4 mb-8">Oops! Page not found.</p>
        <Link 
          to="/dashboard" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;