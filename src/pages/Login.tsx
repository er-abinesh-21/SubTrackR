import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/50 backdrop-blur-lg border border-primary/20 rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]">
            Welcome to SubTrackR
          </h2>
          <p className="text-center text-muted-foreground mt-2">Sign in to continue</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;