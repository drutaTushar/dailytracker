import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  const supabase = await createClient();
  let authError = null;

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  }
  
  // Handle legacy flow (token parameter) - for email confirmations via Supabase's verification endpoint
  else if (token && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
    });
    authError = error;
  }

  // Check if user is authenticated (either from code exchange, token verification, or already logged in)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!authError && !userError && user) {
    try {
      // Check if user has completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      // If profile doesn't exist or onboarding not completed, go to onboarding
      const redirectUrl = profileError || !profile || !profile.onboarding_completed 
        ? `${origin}/onboarding`
        : `${origin}${next}`;
        
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('Error checking user profile:', error);
      // If profile check fails but user is authenticated, assume onboarding needed
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // If we get here, authentication failed or user not found
  console.error('Auth callback error:', authError || userError);
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}