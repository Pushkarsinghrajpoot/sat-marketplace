import { supabase } from './supabase';
import { sendNotification } from './notification-client';

export async function createTeamMemberDirect(data: {
  organizationId: string;
  email: string;
  name: string;
  password: string;
  role: string;
  teamRole: string;
  permissions?: any;
  createdBy: string;
}) {
  try {
    // Create auth account with admin-set password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        email: data.email,
        name: data.name,
        role: data.role,
        team_role: data.teamRole,
        permissions: data.permissions || {},
        organization_id: data.organizationId,
        invited_by: data.createdBy,
        invitation_status: 'ACTIVE',
      });

    if (userError) throw userError;

    // Send welcome notification
    await sendNotification({
      userId: authData.user!.id,
      notificationType: 'TEAM_INVITATION',
      title: 'Welcome to the Team',
      message: `Your account has been created. You can now login with your email and password.`,
      link: '/auth/login',
      emailData: {
        recipientEmail: data.email,
        tempPassword: data.password,
        loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      },
    });

    return { success: true, userId: authData.user!.id };
  } catch (error) {
    console.error('Error creating team member:', error);
    return { success: false, error };
  }
}

export async function inviteTeamMember(data: {
  organizationId: string;
  email: string;
  role: string;
  teamRole: string;
  permissions?: any;
  invitedBy: string;
}) {
  try {
    // Generate unique invitation token
    const token = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .insert({
        organization_id: data.organizationId,
        email: data.email,
        role: data.role,
        team_role: data.teamRole,
        permissions: data.permissions || {},
        invited_by: data.invitedBy,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Send invitation email
    await sendNotification({
      userId: data.invitedBy,
      notificationType: 'TEAM_INVITATION',
      title: 'Team Invitation Sent',
      message: `Invitation sent to ${data.email}`,
      link: '/team',
      emailData: {
        recipientEmail: data.email,
        invitationToken: token,
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`,
      },
    });

    return { success: true, invitation };
  } catch (error) {
    console.error('Error inviting team member:', error);
    return { success: false, error };
  }
}

export async function acceptTeamInvitation(token: string, userData: {
  name: string;
  password: string;
}) {
  try {
    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'PENDING')
      .single();

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: userData.password,
    });

    if (authError) throw authError;

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user!.id,
        email: invitation.email,
        name: userData.name,
        role: invitation.role,
        team_role: invitation.team_role,
        permissions: invitation.permissions,
        organization_id: invitation.organization_id,
        invited_by: invitation.invited_by,
        invitation_status: 'ACTIVE',
      });

    if (userError) throw userError;

    // Update invitation status
    await supabase
      .from('team_invitations')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    return { success: true, userId: authData.user!.id };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error };
  }
}

export async function getTeamMembers(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function getPendingInvitations(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }
}

export async function updateTeamMember(userId: string, updates: {
  teamRole?: string;
  permissions?: any;
  invitationStatus?: string;
}) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        team_role: updates.teamRole,
        permissions: updates.permissions,
        invitation_status: updates.invitationStatus,
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating team member:', error);
    return { success: false, error };
  }
}

export async function removeTeamMember(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ invitation_status: 'SUSPENDED' })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing team member:', error);
    return { success: false, error };
  }
}

export async function createUserAssignment(assignment: {
  userId: string;
  assignmentType: string;
  referenceId?: string;
  metadata?: any;
  createdBy: string;
}) {
  try {
    const { data, error } = await supabase
      .from('user_assignments')
      .insert({
        user_id: assignment.userId,
        assignment_type: assignment.assignmentType,
        reference_id: assignment.referenceId,
        metadata: assignment.metadata || {},
        created_by: assignment.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, assignment: data };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { success: false, error };
  }
}

export async function getUserAssignments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_assignments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

export async function deleteUserAssignment(assignmentId: string) {
  try {
    const { error } = await supabase
      .from('user_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error };
  }
}
