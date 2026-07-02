import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  email: string;
  quoteText: string;
  quoteReference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
    const { email, quoteText, quoteReference }: EmailRequest = await req.json();

    if (!email || !quoteText || !quoteReference) {
      throw new Error("Missing required fields");
    }

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailResponse = await resend.emails.send({
      from: "Daily Inspiration <onboarding@resend.dev>",
      to: [email],
      subject: `Your Daily Inspiration - ${today}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(180deg, #0a0f1a 0%, #1a1a3a 50%, #c94b8c 100%);
              margin: 0;
              padding: 40px 20px;
              min-height: 100vh;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: rgba(20, 25, 40, 0.95);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .badge {
              display: inline-block;
              background: rgba(59, 130, 246, 0.2);
              color: #60a5fa;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              margin-bottom: 10px;
            }
            h1 {
              color: #ffffff;
              font-size: 24px;
              margin: 0;
            }
            .date {
              color: #9ca3af;
              font-size: 14px;
              margin-top: 8px;
            }
            .quote-card {
              background: linear-gradient(135deg, rgba(30, 35, 55, 0.9), rgba(40, 45, 70, 0.7));
              border-radius: 16px;
              padding: 30px;
              margin: 20px 0;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .sparkle {
              text-align: center;
              font-size: 40px;
              margin-bottom: 20px;
            }
            blockquote {
              color: #ffffff;
              font-size: 18px;
              line-height: 1.6;
              text-align: center;
              margin: 0;
              font-style: italic;
            }
            .reference {
              color: #ec4899;
              text-align: center;
              font-size: 14px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">✨ Daily Inspiration</span>
              <h1>Your Morning Verse</h1>
              <p class="date">${today}</p>
            </div>
            <div class="quote-card">
              <div class="sparkle">✨</div>
              <blockquote>"${quoteText}"</blockquote>
              <p class="reference">— ${quoteReference}</p>
            </div>
            <p class="footer">May this verse guide your day with peace and joy.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
