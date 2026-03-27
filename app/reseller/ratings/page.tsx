'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award, Users, MessageSquare } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { getRatingsForUser, getRatingStats } from '@/lib/rating-helpers';
import { RatingDisplay } from '@/components/ratings/RatingDisplay';

export default function ResellerRatingsPage() {
  const { user } = useSimpleAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const statsData = await getRatingStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading rating analytics...</p>
        </div>
      </div>
    );
  }

  const trend = stats?.trend || 0;
  const trendPositive = trend >= 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rating Analytics</h1>
          <p className="text-gray-600">Track your performance ratings from distributors</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.average_rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.total_ratings || 0}</p>
                  <p className="text-sm text-gray-600">Total Ratings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className={`h-8 w-8 ${trendPositive ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="text-2xl font-bold">
                    {trendPositive ? '+' : ''}{trend?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-600">30-Day Trend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats?.last_30_days_count || 0}</p>
                  <p className="text-sm text-gray-600">Recent Ratings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats?.rating_distribution?.[rating.toString()] || 0;
                const percentage = stats?.percentages?.[rating] || 0;

                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-20">
                      <span className="font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 10 && (
                            <span className="text-xs font-semibold text-white">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {stats?.total_ratings === 0 && (
              <p className="text-center text-gray-500 py-8">
                No ratings received yet. Complete more deals to get ratings!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        {stats && stats.total_ratings > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stats.average_rating >= 4.5 ? 'bg-green-100' : 
                      stats.average_rating >= 4.0 ? 'bg-blue-100' : 
                      stats.average_rating >= 3.5 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <Award className={`h-5 w-5 ${
                        stats.average_rating >= 4.5 ? 'text-green-600' : 
                        stats.average_rating >= 4.0 ? 'text-blue-600' : 
                        stats.average_rating >= 3.5 ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {stats.average_rating >= 4.5 ? 'Excellent Performance' :
                         stats.average_rating >= 4.0 ? 'Good Performance' :
                         stats.average_rating >= 3.5 ? 'Average Performance' :
                         'Needs Improvement'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {stats.average_rating >= 4.5 ? 'You\'re in the top tier! Keep up the great work.' :
                         stats.average_rating >= 4.0 ? 'You\'re doing well. Aim for 4.5+ for top tier.' :
                         stats.average_rating >= 3.5 ? 'Focus on improving service quality.' :
                         'Address feedback to improve your ratings.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className={`h-5 w-5 ${trendPositive ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {trendPositive ? 'Improving Trend' : 'Declining Trend'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Your 30-day average is {trendPositive ? 'higher' : 'lower'} than your overall rating
                        {trendPositive ? '. Great job!' : '. Review recent feedback.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-2">Tips to Improve</p>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4">
                      <li>• Respond quickly to distributor inquiries</li>
                      <li>• Provide accurate deal information</li>
                      <li>• Maintain professional communication</li>
                      <li>• Follow up after deal completion</li>
                    </ul>
                  </div>

                  {stats.last_30_days_count > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-900">Recent Activity</p>
                      <p className="text-sm text-green-800 mt-1">
                        You received {stats.last_30_days_count} {stats.last_30_days_count === 1 ? 'rating' : 'ratings'} in the last 30 days
                        with an average of {stats.last_30_days_average?.toFixed(1)} stars.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {user?.id && <RatingDisplay userId={user.id} showStats={false} />}
      </div>
    </div>
  );
}
