# PathPilot — Frontend Starter

Vanilla HTML, CSS, and JavaScript frontend for an AI Learning Path Generator.

## Included pages

- `frontend/index.html` — landing page
- `frontend/pages/register.html` — Supabase email/password registration
- `frontend/pages/login.html` — Supabase email/password login
- `frontend/pages/roadmap.html` — authenticated learning form and roadmap response display
- `frontend/style.css` — responsive styling
- `frontend/script.js` — interactions and Supabase auth
- `frontend/config.js` — public Supabase configuration and n8n webhook URL

## Setup

1. Open `frontend/config.js`.
2. Replace `YOUR_SUPABASE_PROJECT_URL` with the Supabase Project URL.
3. Replace `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with the Supabase publishable/anon key.
4. After creating the n8n roadmap workflow, replace `YOUR_N8N_ROADMAP_WEBHOOK_URL` with its **Production URL**.
5. In Supabase Authentication URL Configuration, add your deployed site URL and local development redirect URL.
6. Serve the site over HTTP(S). Do not open module-based pages directly with `file://`.

## Important security notes

- Only the Supabase publishable/anon key belongs in browser code.
- Never put a Supabase `service_role` key, Gemini API key, SMTP password, or private credential in this folder.
- The n8n workflow must validate the `Authorization: Bearer <Supabase access token>` header server-side before trusting `user_id` or `email` in the request body.
- The frontend's browser-side form validation is for user experience only. Validate all fields again in n8n/backend.
- Configure CORS on the n8n endpoint to allow your deployed frontend origin.
- Do not send passwords to n8n or Google Sheets.
- For a production application, store generated roadmaps in a database with Row Level Security, and only return records belonging to the authenticated user.

## Expected n8n request

The roadmap form sends JSON similar to:

```json
{
  "skill": "Python",
  "current_level": "Beginner",
  "learning_goal": "Prepare for an entry-level AI role",
  "weekly_study_hours": 10,
  "duration": "6 months",
  "user_id": "Supabase-auth-user-uuid",
  "email": "user@example.com"
}
```

The access token is sent in the `Authorization` header. The n8n workflow should verify it with Supabase Auth before processing.

## Expected n8n response

Return JSON such as:

```json
{
  "success": true,
  "roadmap": "Your personalized roadmap text...",
  "email_sent": true
}
```

The page displays the `roadmap` field. Email sending is handled by n8n, not by browser JavaScript.

## Notes

This is a frontend starter, not a complete production backend. Authentication and roadmap generation must be tested with the real Supabase and n8n project settings before deployment.
