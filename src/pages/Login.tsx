import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/integrations/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const errorMessage = getFirebaseErrorMessage(authError.code || "");
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      const errorMessage = getFirebaseErrorMessage(authError.code || "");
      showError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neon">
            Welcome to SubTrackR
          </h2>
          <p className="text-center text-muted-foreground mt-2">
            {isForgotPassword
              ? "Enter your email to reset your password"
              : isSignUp
                ? "Create your account"
                : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
          )}

          <Button type="submit" className="w-full btn-neon" disabled={isLoading || isGoogleLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isForgotPassword
              ? "Send Reset Email"
              : isSignUp
                ? "Sign Up"
                : "Sign In"}
          </Button>
        </form>

        {!isForgotPassword && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-muted-foreground/30 hover:border-neon hover:text-neon transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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

        <div className="space-y-2 text-center">
          {!isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-muted-foreground hover:text-neon transition-colors"
            >
              Forgot your password?
            </button>
          )}

          <div>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsForgotPassword(false);
              }}
              className="text-sm text-muted-foreground hover:text-neon transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          {isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-muted-foreground hover:text-neon transition-colors"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;