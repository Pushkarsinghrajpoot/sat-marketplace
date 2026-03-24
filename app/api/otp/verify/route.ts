import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, otpCode, purpose = 'deal_registration' } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Find the most recent OTP for this email and purpose
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 400 }
      );
    }

    // Increment attempts
    const newAttempts = otpRecord.attempts + 1;

    // Verify OTP code
    if (otpRecord.otp_code !== otpCode) {
      // Update attempts count
      await supabase
        .from('otp_verifications')
        .update({ attempts: newAttempts })
        .eq('id', otpRecord.id);

      const remainingAttempts = otpRecord.max_attempts - newAttempts;
      
      return NextResponse.json(
        { 
          error: 'Invalid verification code',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
        },
        { status: 400 }
      );
    }

    // OTP is correct - mark as verified
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        attempts: newAttempts
      })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating OTP verification:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: otpRecord.email,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in OTP verify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
