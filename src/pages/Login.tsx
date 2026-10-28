import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/integrations/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo, BrandLoader } from "@/components/Logo";
import { OrbitArt } from "@/components/OrbitArt";
import { ThemeToggle } from "@/components/ThemeToggle";

const getFirebaseErrorMessage = (code: string): string => {
  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using another sign-in method.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

const COPY = {
  signin: { title: "Sign in", sub: "Welcome back. Pick up where you left off.", cta: "Sign in" },
  signup: { title: "Create your account", sub: "Start tracking in under a minute.", cta: "Create account" },
  reset: { title: "Reset your password", sub: "We'll email you a link to choose a new one.", cta: "Send reset link" },
};

const linkClass =
  "rounded-md text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline";

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        showSuccess("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        await signUp(email, password);
        showSuccess("Account created successfully!");
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      setFormError(getFirebaseErrorMessage(authError.code || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      showSuccess("Successfully signed in with Google!");
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      if (
        authError.code === "auth/popup-closed-by-user" ||
        authError.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setFormError(getFirebaseErrorMessage(authError.code || ""));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (authLoading) {
    return <BrandLoader className="min-h-screen" />;
  }

  const mode = isForgotPassword ? "reset" : isSignUp ? "signup" : "signin";
  const copy = COPY[mode];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <aside className="force-dark relative hidden overflow-hidden bg-maroon text-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo />
        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          <OrbitArt className="absolute inset-0" />
        </div>
        <div>
          <h2 className="max-w-md text-[2.6rem] font-medium leading-[1.05] tracking-tight">
            Know what renews before it charges you.
          </h2>
          <p className="mt-4 max-w-sm text-foreground/75">
            Every subscription, one monthly total, and a timeline of what's due next.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="w-full max-w-[400px]">
          <Logo className="mb-12 lg:hidden" />

          <h1 className="text-[2rem] font-medium leading-tight">{copy.title}</h1>
          <p className="mt-2 text-muted-foreground">{copy.sub}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-invalid={formError ? true : undefined}
              />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="pr-11"
                    aria-invalid={formError ? true : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {formError && (
              <p
                role="alert"
                className="rounded-[10px] border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
              >
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              {copy.cta}
            </Button>
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-8 flex flex-col items-start gap-2">
            {!isForgotPassword && !isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setFormError(null);
                }}
                className={linkClass}
              >
                Forgot your password?
              </button>
            )}

            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setFormError(null);
                }}
                className={linkClass}
              >
                Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsForgotPassword(false);
                  setFormError(null);
                }}
                className={linkClass}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
