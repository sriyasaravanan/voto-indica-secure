
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  userType: 'user' | 'admin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userType }: SendOTPRequest = await req.json();

    console.log("Received request for email:", email, "userType:", userType);

    if (!email || !userType) {
      throw new Error("Email and user type are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate OTP using database function
    const { data: otpCode, error: otpError } = await supabase
      .rpc('generate_otp', { 
        p_email: email, 
        p_user_type: userType 
      });

    if (otpError) {
      console.error("Error generating OTP:", otpError);
      throw new Error("Failed to generate OTP");
    }

    console.log("Generated OTP:", otpCode, "for email:", email);

    // Verify Resend API key exists
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error("RESEND_API_KEY not found in environment variables");
      throw new Error("Email service not configured");
    }

    // Send email with OTP
    console.log("Attempting to send email to:", email);
    
    const emailResponse = await resend.emails.send({
      from: "भारत वोट <onboarding@resend.dev>",
      to: [email],
      subject: `Your OTP for भारत वोट - ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF6B35; margin: 0;">भारत वोट</h1>
            <p style="color: #1E3A8A; margin: 5px 0;">Blockchain Voting Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #22C55E 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin: 0 0 20px 0;">Your Verification Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #1E3A8A; letter-spacing: 5px;">${otpCode}</span>
            </div>
          </div>
          
          <div style="background: #F8F9FA; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Account Type:</strong> ${userType === 'user' ? 'Voter' : 'Admin'}</p>
            <p style="margin: 0 0 10px 0; color: #374151;"><strong>Valid for:</strong> 10 minutes</p>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">Enter this code in the verification field to complete your login.</p>
          </div>
          
          <div style="text-align: center; color: #6B7280; font-size: 12px;">
            <p>This OTP was requested for secure access to the भारत वोट platform.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully to:", email, "with ID:", emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "OTP sent successfully",
      otpId: emailResponse.data?.id,
      email: email
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check if your email domain is verified in Resend and API key is valid"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
