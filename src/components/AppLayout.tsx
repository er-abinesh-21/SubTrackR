import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/integrations/firebase/auth";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userInitials =
    user?.displayName
      ? user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-8">
          <div className="flex items-center gap-10">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-lg text-neon">SubTrackR</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/dashboard" ? "text-neon" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {user?.photoURL && (
                      <AvatarImage src={user.photoURL} alt={user.displayName || user.email || "User"} />
                    )}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || "My Account"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;