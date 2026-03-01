'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, CheckCircle, Clock, User } from 'lucide-react';
import { getDealActivities, getDealMeetingStats, updateMeetingTask } from '@/lib/meeting-helpers';
import { toast } from 'sonner';

interface MeetingActivityListProps {
  dealId: string;
  userRole?: 'RESELLER' | 'DISTRIBUTOR' | 'END_USER';
}

export default function MeetingActivityList({ dealId, userRole }: MeetingActivityListProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isReadOnly = userRole === 'DISTRIBUTOR' || userRole === 'END_USER';

  useEffect(() => {
    fetchActivities();
  }, [dealId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [activitiesData, statsData] = await Promise.all([
        getDealActivities(dealId),
        getDealMeetingStats(dealId),
      ]);
      setActivities(activitiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    if (isReadOnly) {
      toast.error('You do not have permission to modify tasks');
      return;
    }

    try {
      const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
      await updateMeetingTask(taskId, newStatus);
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'MEETING':
        return <Users className="h-5 w-5" />;
      case 'DEMO':
        return <CheckCircle className="h-5 w-5" />;
      case 'BOQ_REVISION':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'MEETING':
        return 'bg-blue-100 text-blue-700';
      case 'DEMO':
        return 'bg-green-100 text-green-700';
      case 'BOQ_REVISION':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_meetings}</div>
                <div className="text-sm text-gray-600">Meetings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.total_demos}</div>
                <div className="text-sm text-gray-600">Demos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total_boq_revisions}</div>
                <div className="text-sm text-gray-600">BOQ Revisions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.total_score}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activities yet</p>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.scheduled_date).toLocaleString()}
                          </span>
                          <Badge variant="success">+{activity.points} points</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-gray-700 mb-3 ml-14">{activity.description}</p>
                  )}

                  {/* Attendees */}
                  {activity.attendees && activity.attendees.length > 0 && (
                    <div className="ml-14 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Attendees:</h5>
                      <div className="flex flex-wrap gap-2">
                        {activity.attendees.map((attendee: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            <User className="h-3 w-3" />
                            <span>{attendee.name}</span>
                            {attendee.role && <span className="text-gray-500">({attendee.role})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decisions */}
                  {activity.decisions && activity.decisions.length > 0 && (
                    <div className="ml-14 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Decisions Taken:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {activity.decisions.map((decision: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">{decision.decision_text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tasks */}
                  {activity.tasks && activity.tasks.length > 0 && (
                    <div className="ml-14">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Action Items:</h5>
                      <div className="space-y-2">
                        {activity.tasks.map((task: any) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${
                              task.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className={`text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.task_description}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {task.owner_name}
                                  </span>
                                  {task.deadline && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {!isReadOnly && (
                                <Button
                                  size="sm"
                                  variant={task.status === 'COMPLETED' ? 'outline' : 'primary'}
                                  onClick={() => handleToggleTask(task.id, task.status)}
                                >
                                  {task.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activity.notes && (
                    <div className="ml-14 mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {activity.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
