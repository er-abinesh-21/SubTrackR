import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NOTE: This function is designed to be triggered by a cron job.
// You can set this up in the Supabase dashboard.

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key to access all data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Calculate the date range for reminders (due in the next 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const todayISO = today.toISOString().split('T')[0];
    const sevenDaysFromNowISO = sevenDaysFromNow.toISOString().split('T')[0];

    // 2. Fetch subscriptions that are due within the next 7 days
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .gte('next_due_date', todayISO)
      .lte('next_due_date', sevenDaysFromNowISO)
      .eq('is_active', true);

    if (subsError) {
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions due for reminders today.");
      return new Response(JSON.stringify({ message: "No subscriptions due for reminders." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${subscriptions.length} subscriptions for reminders.`);

    // 3. Process each subscription
    for (const sub of subscriptions) {
      // Get the user's email address
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);

      if (userError || !user || !user.email) {
        console.error(`Could not find user or email for user_id: ${sub.user_id}. Error: ${userError?.message}`);
        continue; // Skip to the next subscription
      }

      const userEmail = user.email;
      const dueDate = new Date(sub.next_due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 4. SIMULATE SENDING AN EMAIL
      // In a real application, you would integrate an email service like Resend or SendGrid here.
      console.log("--- EMAIL REMINDER ---");
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Upcoming Subscription Payment: ${sub.name}`);
      console.log(`Body: Reminder that your subscription for ${sub.name} ($${sub.price}) is due on ${dueDate}.`);
      console.log("----------------------");
    }

    return new Response(JSON.stringify({ message: `Processed ${subscriptions.length} reminders.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})