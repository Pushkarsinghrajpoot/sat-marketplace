import { supabase } from './supabase';
import { sendNotification } from './notification-client';

export async function getPendingQualifications(options?: {
  limit?: number;
  type?: 'users' | 'organizations' | 'documents';
}) {
  try {
    if (options?.type === 'documents') {
      const { data, error } = await supabase
        .from('organization_documents')
        .select(`
          *,
          organizations (
            id,
            name,
            type
          ),
          reviewed_by_user:reviewed_by (
            id,
            name
          )
        `)
        .eq('status', 'PENDING')
        .order('uploaded_at', { ascending: true })
        .limit(options?.limit || 50);

      if (error) throw error;
      return data || [];
    }

    if (options?.type === 'organizations') {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .eq('qualification_status', 'PENDING')
        .order('qualification_submitted_at', { ascending: true })
        .limit(options?.limit || 50);

      if (error) throw error;
      return data || [];
    }

    // Default to users
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        organizations (
          id,
          name,
          type
        )
      `)
      .eq('qualification_status', 'PENDING')
      .order('qualification_submitted_at', { ascending: true })
      .limit(options?.limit || 50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending qualifications:', error);
    return [];
  }
}

export async function approveUserQualification(
  userId: string,
  adminId: string,
  notes?: string
) {
  try {
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({
        qualification_status: 'APPROVED',
        can_access_marketplace: true,
      })
      .eq('id', userId);

    if (userError) throw userError;

    // Log admin activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'USER_REVIEW',
      p_target_type: 'USER',
      p_target_id: userId,
      p_action: 'APPROVED',
      p_description: notes || 'User qualification approved',
    });

    // Notify user
    await sendNotification({
      userId: userId,
      notificationType: 'QUALIFICATION_APPROVED',
      title: 'Qualification Approved',
      message: 'Your account has been approved. You can now access the marketplace.',
      link: '/dashboard',
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving user:', error);
    return { success: false, error };
  }
}

export async function rejectUserQualification(
  userId: string,
  adminId: string,
  reason: string
) {
  try {
    const { error: userError } = await supabase
      .from('users')
      .update({
        qualification_status: 'REJECTED',
        can_access_marketplace: false,
      })
      .eq('id', userId);

    if (userError) throw userError;

    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'USER_REVIEW',
      p_target_type: 'USER',
      p_target_id: userId,
      p_action: 'REJECTED',
      p_description: reason,
    });

    await sendNotification({
      userId: userId,
      notificationType: 'QUALIFICATION_REJECTED',
      title: 'Qualification Rejected',
      message: `Your qualification was not approved. Reason: ${reason}`,
      link: '/onboarding/qualification',
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting user:', error);
    return { success: false, error };
  }
}

export async function requestAdditionalInfo(
  userId: string,
  adminId: string,
  infoRequired: string
) {
  try {
    const { error: userError } = await supabase
      .from('users')
      .update({
        qualification_status: 'INFO_REQUIRED',
      })
      .eq('id', userId);

    if (userError) throw userError;

    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'USER_REVIEW',
      p_target_type: 'USER',
      p_target_id: userId,
      p_action: 'INFO_REQUIRED',
      p_description: infoRequired,
    });

    await sendNotification({
      userId: userId,
      notificationType: 'INFO_REQUIRED',
      title: 'Additional Information Required',
      message: infoRequired,
      link: '/onboarding/qualification',
    });

    return { success: true };
  } catch (error) {
    console.error('Error requesting info:', error);
    return { success: false, error };
  }
}

export async function approveDocument(
  documentId: string,
  adminId: string,
  notes?: string
) {
  try {
    const { error } = await supabase
      .from('organization_documents')
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        review_notes: notes,
      })
      .eq('id', documentId);

    if (error) throw error;

    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'DOCUMENT_REVIEW',
      p_target_type: 'DOCUMENT',
      p_target_id: documentId,
      p_action: 'APPROVED',
      p_description: notes || 'Document approved',
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving document:', error);
    return { success: false, error };
  }
}

export async function rejectDocument(
  documentId: string,
  adminId: string,
  reason: string
) {
  try {
    const { error } = await supabase
      .from('organization_documents')
      .update({
        status: 'REJECTED',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        review_notes: reason,
      })
      .eq('id', documentId);

    if (error) throw error;

    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'DOCUMENT_REVIEW',
      p_target_type: 'DOCUMENT',
      p_target_id: documentId,
      p_action: 'REJECTED',
      p_description: reason,
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting document:', error);
    return { success: false, error };
  }
}

export async function assignBadge(
  organizationId: string,
  badge: string,
  adminId: string
) {
  try {
    const { error } = await supabase
      .from('organizations')
      .update({
        badge,
        is_verified: true,
      })
      .eq('id', organizationId);

    if (error) throw error;

    await supabase.rpc('log_admin_activity', {
      p_admin_id: adminId,
      p_activity_type: 'BADGE_ASSIGNMENT',
      p_target_type: 'ORGANIZATION',
      p_target_id: organizationId,
      p_action: 'BADGE_ASSIGNED',
      p_description: `Badge ${badge} assigned`,
      p_metadata: { badge },
    });

    return { success: true };
  } catch (error) {
    console.error('Error assigning badge:', error);
    return { success: false, error };
  }
}

export async function getAdminStats() {
  try {
    const [
      pendingUsers,
      pendingDocs,
      pendingOrgs,
      totalUsers,
      totalOrgs,
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('qualification_status', 'PENDING'),
      supabase.from('organization_documents').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('organizations').select('id', { count: 'exact', head: true }).eq('qualification_status', 'PENDING'),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
    ]);

    return {
      pendingUsers: pendingUsers.count || 0,
      pendingDocuments: pendingDocs.count || 0,
      pendingOrganizations: pendingOrgs.count || 0,
      totalUsers: totalUsers.count || 0,
      totalOrganizations: totalOrgs.count || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

export async function getAdminActivityLog(options?: {
  limit?: number;
  adminId?: string;
  activityType?: string;
}) {
  try {
    let query = supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin:admin_id (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.adminId) {
      query = query.eq('admin_id', options.adminId);
    }

    if (options?.activityType) {
      query = query.eq('activity_type', options.activityType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }
}

export async function getOrganizationDocuments(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from('organization_documents')
      .select(`
        *,
        reviewed_by_user:reviewed_by (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching organization documents:', error);
    return [];
  }
}
