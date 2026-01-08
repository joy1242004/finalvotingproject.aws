import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "ACS BlockVote Pro <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VoteConfirmationRequest {
  email: string;
  voterName: string;
  electionTitle: string;
  candidateName: string;
  transactionHash: string;
  blockNumber: number;
  voterHash: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      voterName,
      electionTitle,
      candidateName,
      transactionHash,
      blockNumber,
      voterHash,
      timestamp,
    }: VoteConfirmationRequest = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ACSVote App <onboarding@resend.dev>",
        to: [email],
        subject: `Vote Confirmation - ${electionTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a9e9e, #0d5f5f); color: white; padding: 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 10px 0 0; opacity: 0.9; }
              .content { padding: 30px; }
              .success-icon { font-size: 48px; margin-bottom: 10px; }
              .details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { color: #6c757d; font-size: 14px; }
              .detail-value { font-weight: 600; color: #212529; font-size: 14px; word-break: break-all; }
              .hash-box { background: #e9ecef; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; background: #f8f9fa; }
              .verify-note { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✓</div>
                <h1>Vote Successfully Cast!</h1>
                <p>Your vote has been recorded on the blockchain</p>
              </div>
              <div class="content">
                <p>Hello <strong>${voterName}</strong>,</p>
                <p>Your vote in the <strong>${electionTitle}</strong> election has been successfully recorded. Here are your transaction details:</p>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="detail-label">Election</span>
                    <span class="detail-value">${electionTitle}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Candidate Selected</span>
                    <span class="detail-value">${candidateName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Block Number</span>
                    <span class="detail-value">#${blockNumber}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Timestamp</span>
                    <span class="detail-value">${new Date(timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <p><strong>Voter Address:</strong></p>
                <div class="hash-box">${voterHash}</div>

                <p><strong>Transaction Hash:</strong></p>
                <div class="hash-box">${transactionHash}</div>

                <div class="verify-note">
                  <strong>🔍 Verify Your Vote</strong><br>
                  You can verify your vote anytime by visiting the Public Ledger in the app and searching for your wallet address or transaction hash.
                </div>

                <p>Thank you for participating in this election!</p>
              </div>
              <div class="footer">
                <p>This is an automated message from ACS BlockVote Pro.</p>
                <p>Your vote is secure and immutable on the blockchain.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      // Log the error but don't throw - email confirmations are non-critical
      console.warn("Vote confirmation email failed (non-critical):", emailResponse);
      return new Response(
        JSON.stringify({ warning: "Email not sent - Resend domain not verified", details: emailResponse }),
        {
          status: 200, // Return 200 so voting isn't blocked
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Vote confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-vote-confirmation function:", error);
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
