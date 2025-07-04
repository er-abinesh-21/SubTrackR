import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { format } from "https://deno.land/std@0.208.0/datetime/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Check for the secret cron key to ensure the request is authorized
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    // 2. Find all active subscriptions due in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const formattedDate = format(threeDaysFromNow, "yyyy-MM-dd");

    const { data: subscriptions, error } = await supabaseAdmin
      .from("subscriptions")
      .select("name, price, next_due_date, users ( email )")
      .lte("next_due_date", formattedDate)
      .eq("is_active", true);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscriptions due for reminders." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 3. Send reminder emails using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Skipping email sending.");
      return new Response(JSON.stringify({ message: "Reminders processed, but no email API key found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const emailPromises = subscriptions.map(async (sub: any) => {
      const userEmail = sub.users?.email;
      if (!userEmail) return;

      const emailPayload = {
        from: "SubTrackr <onboarding@resend.dev>", // IMPORTANT: Change this to your verified domain in Resend
        to: [userEmail],
        subject: `Reminder: Your ${sub.name} subscription is due soon!`,
        html: `
          <h1>Subscription Reminder</h1>
          <p>Hi there,</p>
          <p>This is a reminder that your <strong>${sub.name}</strong> subscription for <strong>$${sub.price.toFixed(2)}</strong> is due on <strong>${format(new Date(sub.next_due_date), "MMMM dd, yyyy")}</strong>.</p>
          <p>Thanks,</p>
          <p>The SubTrackr Team</p>
        `,
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error(`Failed to send email to ${userEmail}:`, errorBody);
      } else {
        console.log(`Reminder email sent to ${userEmail} for ${sub.name}`);
      }
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ message: `Processed ${subscriptions.length} reminders.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});