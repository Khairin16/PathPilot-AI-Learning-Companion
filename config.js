// Replace these placeholders with your Supabase project values.
// Supabase Dashboard -> Project Settings -> API
// Use the Project URL and the publishable/anon key only.
// NEVER put a service_role key, SMTP password, or Gemini API key in frontend code.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Paste the n8n Production Webhook URL after the workflow is ready.
// Keep this as a public endpoint only; the workflow must verify the Supabase JWT.
export const ROADMAP_WEBHOOK_URL = "YOUR_N8N_ROADMAP_WEBHOOK_URL";
