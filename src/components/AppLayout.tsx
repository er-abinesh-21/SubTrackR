import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [{ to: "/dashboard", label: "Dashboard" }];

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
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center">
          <Link to="/dashboard" aria-label="SubTrackR home" className="rounded-lg">
            <Logo />
          </Link>
          <nav className="ml-10 hidden gap-1 md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const isCurrent = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-highlight transition-opacity ${
                      isCurrent ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="rounded-full ring-1 ring-border transition-shadow hover:ring-foreground/40 data-[state=open]:ring-foreground/60"
                >
                  <Avatar className="h-9 w-9">
                    {user?.photoURL && (
                      <AvatarImage src={user.photoURL} alt={user.displayName || user.email || "User"} />
                    )}
                    <AvatarFallback className="bg-secondary font-display text-xs font-semibold text-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-xl p-1.5" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || "Signed in"}
                    </p>
                    <p className="truncate text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main id="content" className="container mx-auto pb-24 pt-8 md:pt-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
