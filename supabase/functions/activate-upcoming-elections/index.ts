
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Get the current timestamp in ISO format
    const now = new Date().toISOString();

    // Find all elections that are Upcoming and have a start_date <= now
    const { data: upcomingElections, error: fetchError } = await supabase
      .from("elections")
      .select("id")
      .eq("status", "Upcoming")
      .lte("start_date", now);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500 }
      );
    }

    if (!upcomingElections || upcomingElections.length === 0) {
      return new Response(
        JSON.stringify({ message: "No elections to activate." }),
        { status: 200 }
      );
    }

    const activateIds = upcomingElections.map((e: any) => e.id);

    const { error: updateError } = await supabase
      .from("elections")
      .update({ status: "Active", updated_at: now })
      .in("id", activateIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: `Activated ${activateIds.length} election(s).` }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
