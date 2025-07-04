import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    <div className="min-h-screen flex items-center justify-center dark">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/50 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-lg shadow-primary/20">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
            Sign in to SubTrackR
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--accent))',
                  defaultButtonBackground: 'hsl(var(--primary))',
                  defaultButtonBackgroundHover: 'hsl(var(--primary) / 0.9)',
                  inputBackground: 'hsl(var(--background) / 0.5)',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--primary))',
                  inputBorderFocus: 'hsl(var(--primary))',
                  inputText: 'hsl(var(--foreground))',
                  messageText: 'hsl(var(--muted-foreground))',
                  messageTextDanger: 'hsl(var(--destructive))',
                },
                radii: {
                  borderRadius: 'var(--radius)',
                  buttonBorderRadius: 'var(--radius)',
                }
              },
            },
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;