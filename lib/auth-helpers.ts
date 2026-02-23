import { supabase } from './supabase';
import type { User } from './types';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }

  return userData as User;
}

export async function getUserWithOrganization(userId: string) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    return { user: null, organization: null };
  }

  if (!userData.organization_id) {
    return { user: userData as User, organization: null };
  }

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userData.organization_id)
    .single();

  if (orgError) {
    console.error('Error fetching organization:', orgError);
    return { user: userData as User, organization: null };
  }

  return { user: userData as User, organization: orgData };
}

export async function updateLastLogin(userId: string) {
  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId);
}
