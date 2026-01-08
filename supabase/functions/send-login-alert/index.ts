import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "ACS BlockVote Pro <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoginAlertRequest {
  email: string;
  userName: string;
  loginTime: string;
  userAgent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, loginTime, userAgent }: LoginAlertRequest = await req.json();

    // Parse user agent for device info
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[0] || "Unknown Browser";
    const deviceType = isMobile ? "Mobile Device" : "Desktop/Laptop";

    const formattedTime = new Date(loginTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ACSVote App <onboarding@resend.dev>",
        to: [email],
        subject: "🔐 New Login Alert - ACS BlockVote Pro",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .alert-icon { font-size: 48px; margin-bottom: 10px; }
              .details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { color: #6c757d; font-size: 14px; }
              .detail-value { font-weight: 600; color: #212529; font-size: 14px; }
              .warning-note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; background: #f8f9fa; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="alert-icon">🔐</div>
                <h1>New Login Detected</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>We detected a new login to your ACS BlockVote Pro account. Here are the details:</p>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="detail-label">Time</span>
                    <span class="detail-value">${formattedTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Device Type</span>
                    <span class="detail-value">${deviceType}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Browser</span>
                    <span class="detail-value">${browser}</span>
                  </div>
                </div>

                <div class="warning-note">
                  <strong>⚠️ Didn't recognize this login?</strong><br>
                  If you didn't log in recently, please reset your password immediately and contact support.
                </div>

                <p>Thank you for using ACS BlockVote Pro!</p>
              </div>
              <div class="footer">
                <p>This is an automated security alert from ACS BlockVote Pro.</p>
                <p>Your account security is our priority.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      // Log the error but don't throw - email alerts are non-critical
      console.warn("Login alert email failed (non-critical):", emailResponse);
      return new Response(
        JSON.stringify({ warning: "Email not sent - Resend domain not verified", details: emailResponse }),
        {
          status: 200, // Return 200 so login isn't blocked
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Login alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-login-alert function:", error);
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
