import { supabase } from './supabase';

// Meeting Activity Types
export interface MeetingData {
  deal_id: string;
  reseller_id: string;
  activity_type: 'MEETING' | 'DEMO' | 'BOQ_REVISION';
  title: string;
  description?: string;
  scheduled_date: string;
  notes?: string;
  attendees: Array<{ name: string; email?: string; role?: string }>;
  decisions?: string[];
  tasks?: Array<{
    task_description: string;
    owner_name: string;
    owner_email?: string;
    deadline?: string;
  }>;
}

export interface MeetingActivity {
  id: string;
  deal_id: string;
  reseller_id: string;
  activity_type: string;
  title: string;
  description?: string;
  scheduled_date: string;
  points: number;
  status: string;
  notes?: string;
  created_at: string;
  attendees?: any[];
  decisions?: any[];
  tasks?: any[];
}

// Create a complete meeting with attendees, decisions, and tasks
export async function createMeeting(meetingData: MeetingData) {
  try {
    // 1. Create the activity
    const { data: activity, error: activityError } = await supabase
      .from('deal_activities')
      .insert({
        deal_id: meetingData.deal_id,
        reseller_id: meetingData.reseller_id,
        activity_type: meetingData.activity_type,
        title: meetingData.title,
        description: meetingData.description,
        scheduled_date: meetingData.scheduled_date,
        notes: meetingData.notes,
        status: 'ACKNOWLEDGED', // Auto-acknowledge for MVP
        acknowledged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (activityError) throw activityError;

    const activityId = activity.id;

    // 2. Add attendees
    if (meetingData.attendees && meetingData.attendees.length > 0) {
      const attendeesData = meetingData.attendees.map(att => ({
        activity_id: activityId,
        name: att.name,
        email: att.email,
        role: att.role,
      }));

      const { error: attendeesError } = await supabase
        .from('meeting_attendees')
        .insert(attendeesData);

      if (attendeesError) console.error('Error adding attendees:', attendeesError);
    }

    // 3. Add decisions
    if (meetingData.decisions && meetingData.decisions.length > 0) {
      const decisionsData = meetingData.decisions.map((decision, idx) => ({
        activity_id: activityId,
        decision_text: decision,
        decision_order: idx,
      }));

      const { error: decisionsError } = await supabase
        .from('meeting_decisions')
        .insert(decisionsData);

      if (decisionsError) console.error('Error adding decisions:', decisionsError);
    }

    // 4. Add tasks
    if (meetingData.tasks && meetingData.tasks.length > 0) {
      const tasksData = meetingData.tasks.map(task => ({
        activity_id: activityId,
        task_description: task.task_description,
        owner_name: task.owner_name,
        owner_email: task.owner_email,
        deadline: task.deadline,
        status: 'PENDING',
      }));

      const { error: tasksError } = await supabase
        .from('meeting_tasks')
        .insert(tasksData);

      if (tasksError) console.error('Error adding tasks:', tasksError);
    }

    return activity;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

// Get all activities for a deal with full details
export async function getDealActivities(dealId: string): Promise<MeetingActivity[]> {
  try {
    const { data: activities, error } = await supabase
      .from('deal_activities')
      .select('*')
      .eq('deal_id', dealId)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;

    // Fetch related data for each activity
    const enrichedActivities = await Promise.all(
      (activities || []).map(async (activity) => {
        const [attendees, decisions, tasks] = await Promise.all([
          supabase
            .from('meeting_attendees')
            .select('*')
            .eq('activity_id', activity.id),
          supabase
            .from('meeting_decisions')
            .select('*')
            .eq('activity_id', activity.id)
            .order('decision_order'),
          supabase
            .from('meeting_tasks')
            .select('*')
            .eq('activity_id', activity.id)
            .order('deadline'),
        ]);

        return {
          ...activity,
          attendees: attendees.data || [],
          decisions: decisions.data || [],
          tasks: tasks.data || [],
        };
      })
    );

    return enrichedActivities;
  } catch (error) {
    console.error('Error fetching deal activities:', error);
    return [];
  }
}

// Get meeting statistics for a deal
export async function getDealMeetingStats(dealId: string) {
  try {
    const { data, error } = await supabase
      .from('deal_activities')
      .select('activity_type, points, status')
      .eq('deal_id', dealId);

    if (error) throw error;

    const stats = {
      total_meetings: data?.filter(a => a.activity_type === 'MEETING').length || 0,
      total_demos: data?.filter(a => a.activity_type === 'DEMO').length || 0,
      total_boq_revisions: data?.filter(a => a.activity_type === 'BOQ_REVISION').length || 0,
      total_score: data?.reduce((sum, a) => sum + (a.status === 'ACKNOWLEDGED' ? a.points : 0), 0) || 0,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    return {
      total_meetings: 0,
      total_demos: 0,
      total_boq_revisions: 0,
      total_score: 0,
    };
  }
}

// Update task status
export async function updateMeetingTask(taskId: string, status: 'PENDING' | 'COMPLETED') {
  const updates: any = { status };
  
  if (status === 'COMPLETED') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('meeting_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

// Get all pending tasks across all deals for a user
export async function getUserPendingTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('meeting_tasks')
      .select(`
        *,
        deal_activities!inner(
          deal_id,
          deals!inner(
            opportunity_name,
            reseller_id
          )
        )
      `)
      .eq('deal_activities.deals.reseller_id', userId)
      .eq('status', 'PENDING')
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return [];
  }
}
