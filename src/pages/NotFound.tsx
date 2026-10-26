import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-16 items-center">
        <Link to="/" aria-label="SubTrackR home" className="rounded-lg">
          <Logo />
        </Link>
      </header>
      <main className="container mx-auto flex flex-1 flex-col items-start justify-center pb-24">
        <p className="font-display text-[clamp(7rem,28vw,18rem)] font-light leading-[0.8] tracking-[-0.05em] text-secondary">
          404
        </p>
        <h1 className="mt-8 text-3xl font-medium">Oops! Page not found.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          That link doesn't lead anywhere. It may have moved, or the address was mistyped.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/">Return to Home</Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
