import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = 'deal_registration' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if there's a recent unverified OTP for this email
    const { data: existingOTP } = await supabaseServer
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If there's a recent OTP (less than 2 minutes old), don't send a new one
    if (existingOTP) {
      const createdAt = new Date(existingOTP.created_at);
      const timeSinceCreation = Date.now() - createdAt.getTime();
      const twoMinutes = 2 * 60 * 1000;

      if (timeSinceCreation < twoMinutes) {
        return NextResponse.json(
          { 
            error: 'Please wait before requesting a new OTP',
            retryAfter: Math.ceil((twoMinutes - timeSinceCreation) / 1000)
          },
          { status: 429 }
        );
      }
    }

    // Store OTP in database
    const { data: otpRecord, error: dbError } = await supabaseServer
      .from('otp_verifications')
      .insert({
        email,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing OTP:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    // Send OTP email
    try {
      console.log('Attempting to send OTP email to:', email);
      console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
      
      const emailResult = await resend.emails.send({
        from: 'SAT Marketplace <noreply@one.satmz.com>',
        to: email,
        subject: 'Your Verification Code - SAT Marketplace',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Email Verification</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hello,
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Your verification code for ${purpose === 'deal_registration' ? 'Deal Registration' : 'Email Verification'} is:
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                  <h2 style="font-size: 36px; letter-spacing: 8px; color: #667eea; margin: 0; font-weight: bold;">
                    ${otpCode}
                  </h2>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  This code will expire in <strong>10 minutes</strong>.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                  If you didn't request this code, please ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} SAT Marketplace. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailResult.error) {
        console.error('Resend API error:', emailResult.error);
        throw new Error(emailResult.error.message || 'Failed to send email via Resend');
      }

      console.log('Email sent successfully to:', email);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600, // 10 minutes in seconds
      });
    } catch (emailError: any) {
      console.error('Error sending email:', emailError);
      console.error('Error details:', emailError.message, emailError.stack);
      
      // Delete the OTP record if email fails
      await supabaseServer
        .from('otp_verifications')
        .delete()
        .eq('id', otpRecord.id);

      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in OTP send route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
