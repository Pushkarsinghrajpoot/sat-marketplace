'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createMeeting } from '@/lib/meeting-helpers';
import { supabase } from '@/lib/supabase';

interface CreateMeetingModalProps {
  dealId: string;
  resellerId: string;
  organizationId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetingModal({ dealId, resellerId, organizationId, onClose, onSuccess }: CreateMeetingModalProps) {
  const [activityType, setActivityType] = useState<'MEETING' | 'DEMO' | 'BOQ_REVISION'>('MEETING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(resellerId);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  // Attendees
  const [attendees, setAttendees] = useState([{ name: '', email: '', role: '' }]);
  
  // Decisions (only for MEETING)
  const [decisions, setDecisions] = useState(['']);
  
  // Tasks (only for MEETING)
  const [tasks, setTasks] = useState([
    { task_description: '', owner_name: '', owner_email: '', deadline: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, [organizationId]);

  const loadTeamMembers = async () => {
    if (!organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('organization_id', organizationId)
        .order('name');
      
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: '', email: '', role: '' }]);
  };

  const removeAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const addDecision = () => {
    setDecisions([...decisions, '']);
  };

  const removeDecision = (index: number) => {
    setDecisions(decisions.filter((_, i) => i !== index));
  };

  const updateDecision = (index: number, value: string) => {
    const updated = [...decisions];
    updated[index] = value;
    setDecisions(updated);
  };

  const addTask = () => {
    setTasks([...tasks, { task_description: '', owner_name: '', owner_email: '', deadline: '' }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: string, value: string) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!title || !scheduledDate) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);

    try {
      const meetingData = {
        deal_id: dealId,
        reseller_id: assignedUserId || resellerId,
        activity_type: activityType,
        title,
        description,
        scheduled_date: scheduledDate,
        notes,
        attendees: attendees.filter(a => a.name.trim() !== ''),
        decisions: activityType === 'MEETING' ? decisions.filter(d => d.trim() !== '') : undefined,
        tasks: activityType === 'MEETING' ? tasks.filter(t => t.task_description.trim() !== '') : undefined,
      };

      await createMeeting(meetingData);
      
      toast.success(`${activityType === 'MEETING' ? 'Meeting' : activityType === 'DEMO' ? 'Demo' : 'BOQ Revision'} created successfully! +10 points`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Deal Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Activity Type *</label>
            <Select value={activityType} onChange={(e) => setActivityType(e.target.value as any)}>
              <option value="MEETING">Meeting (+10 points)</option>
              <option value="DEMO">Demo (+10 points)</option>
              <option value="BOQ_REVISION">BOQ Revision (+10 points)</option>
            </Select>
          </div>

          {/* Assign to Team Member */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Assign to Team Member</label>
              <Select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-600 mt-1">
                This activity will be assigned to the selected team member
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {activityType === 'MEETING' ? 'Meeting Title' : activityType === 'DEMO' ? 'Demo Title' : 'Revision Title'} *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activityType === 'MEETING' ? 'e.g., Product Requirements Discussion' : 'e.g., Network Solutions Demo'}
            />
          </div>

          {/* Scheduled Date & Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Date & Time *</label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Agenda or description..."
            />
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Attendees</label>
              <Button size="sm" variant="outline" onClick={addAttendee}>
                <Plus className="h-4 w-4 mr-1" />
                Add Attendee
              </Button>
            </div>
            <div className="space-y-2">
              {attendees.map((attendee, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <Input
                    placeholder="Name *"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(idx, 'email', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Role"
                    value={attendee.role}
                    onChange={(e) => updateAttendee(idx, 'role', e.target.value)}
                    className="flex-1"
                  />
                  {attendees.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeAttendee(idx)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decisions (only for MEETING) */}
          {activityType === 'MEETING' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Decisions Taken</label>
                <Button size="sm" variant="outline" onClick={addDecision}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Decision
                </Button>
              </div>
              <div className="space-y-2">
                {decisions.map((decision, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Textarea
                      placeholder="Decision or agreement reached..."
                      value={decision}
                      onChange={(e) => updateDecision(idx, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    {decisions.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeDecision(idx)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks (only for MEETING) */}
          {activityType === 'MEETING' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Meeting Tasks</label>
                <Button size="sm" variant="outline" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Task description *"
                        value={task.task_description}
                        onChange={(e) => updateTask(idx, 'task_description', e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      {tasks.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeTask(idx)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Owner name *"
                        value={task.owner_name}
                        onChange={(e) => updateTask(idx, 'owner_name', e.target.value)}
                      />
                      <Input
                        placeholder="Owner email"
                        type="email"
                        value={task.owner_email}
                        onChange={(e) => updateTask(idx, 'owner_email', e.target.value)}
                      />
                      <Input
                        type="date"
                        placeholder="Deadline"
                        value={task.deadline}
                        onChange={(e) => updateTask(idx, 'deadline', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
