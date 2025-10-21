'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell, Activity, Users, Send, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  module: string;
  item_id: string;
  replies?: Comment[];
}

interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'deadline' | 'update' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

// Sample data
const sampleComments: Comment[] = [
  { id: 'C-1', author: 'CTO', timestamp: '2025-10-15 10:30', content: 'PCB layout review completato. Sembra ok, procedere con fabrication?', module: 'WBS', item_id: '1.1' },
  { id: 'C-2', author: 'HW Engineer', timestamp: '2025-10-15 11:15', content: '✅ Approvato! Ho già contattato Vendor A per quote.', module: 'WBS', item_id: '1.1' },
  { id: 'C-3', author: 'AI Engineer', timestamp: '2025-10-14 16:00', content: 'Training U-Net: accuracy 92% su validation set. Serve più data augmentation?', module: 'Kanban', item_id: 'K-4' },
  { id: 'C-4', author: 'COO', timestamp: '2025-10-13 09:00', content: 'Investor meeting confermato 25 Oct. Preparare pitch deck aggiornato con timeline Gantt.', module: 'Gantt', item_id: 'M-1' },
  { id: 'C-5', author: 'QA/RA', timestamp: '2025-10-12 14:30', content: 'Risk Management ISO 14971: identificati 15 hazard. FMEA in progress.', module: 'RAID', item_id: 'R-3' }
];

const sampleNotifications: Notification[] = [
  { id: 'N-1', type: 'mention', title: '@You in WBS 1.1', description: 'CTO ti ha menzionato in "Prototipo HW V1"', timestamp: '5 min ago', read: false },
  { id: 'N-2', type: 'assignment', title: 'New task assigned', description: 'Task "FPGA Beamforming" assegnato a te da CTO', timestamp: '1 hour ago', read: false },
  { id: 'N-3', type: 'deadline', title: 'Deadline approaching', description: 'Firmware V1 scadenza domani (30 Sep)', timestamp: '2 hours ago', read: false },
  { id: 'N-4', type: 'update', title: 'CBS updated', description: 'COO ha aggiornato budget CBS per WBS 2.1', timestamp: '3 hours ago', read: true },
  { id: 'N-5', type: 'approval', title: 'Approval request', description: 'DoA: richiesta approvazione budget €10K da HW Engineer', timestamp: '1 day ago', read: true }
];

const sampleActivity: ActivityLog[] = [
  { id: 'A-1', actor: 'CTO', action: 'updated', target: 'Gantt task G-1.1 progress to 85%', timestamp: '10 min ago', icon: <Activity className="h-4 w-4" />, color: 'text-blue-600' },
  { id: 'A-2', actor: 'AI Engineer', action: 'completed', target: 'Kanban task K-4', timestamp: '1 hour ago', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
  { id: 'A-3', actor: 'COO', action: 'created', target: 'CBS entry for WBS 2.1', timestamp: '2 hours ago', icon: <Info className="h-4 w-4" />, color: 'text-purple-600' },
  { id: 'A-4', actor: 'QA/RA', action: 'added', target: 'RAID risk R-5: Regulatory delay', timestamp: '3 hours ago', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-600' },
  { id: 'A-5', actor: 'HW Engineer', action: 'commented on', target: 'PBS component 1.2.2', timestamp: '4 hours ago', icon: <MessageSquare className="h-4 w-4" />, color: 'text-orange-600' },
  { id: 'A-6', actor: 'CEO', action: 'approved', target: 'DoA request €10K budget', timestamp: '5 hours ago', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
  { id: 'A-7', actor: 'CTO', action: 'assigned', target: 'Task "FPGA driver" to CTO', timestamp: '1 day ago', icon: <Users className="h-4 w-4" />, color: 'text-blue-600' }
];

export function CollaborationPanel() {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const unreadNotifications = sampleNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention': return <MessageSquare className="h-4 w-4" />;
      case 'assignment': return <Users className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'update': return <Info className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'mention': return 'bg-blue-100 text-blue-700';
      case 'assignment': return 'bg-purple-100 text-purple-700';
      case 'deadline': return 'bg-red-100 text-red-700';
      case 'update': return 'bg-green-100 text-green-700';
      case 'approval': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">Collaboration Tools - Team Communication</h4>
              <p className="text-sm text-orange-700 mb-3">
                Commenti real-time su qualsiasi elemento (WBS, task, decisione, risk), notifiche @mention, activity log per tracciare modifiche.
                Perfetto per team distribuiti e async collaboration.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />Comments</div>
                <div className="flex items-center gap-1"><Bell className="h-3 w-3" />Notifications</div>
                <div className="flex items-center gap-1"><Activity className="h-3 w-3" />Activity Log</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <button
              onClick={() => { setShowComments(true); setShowNotifications(false); setShowActivity(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                showComments ? 'bg-blue-100 text-blue-700 border-2 border-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Comments ({sampleComments.length})
            </button>
            <button
              onClick={() => { setShowComments(false); setShowNotifications(true); setShowActivity(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors relative ${
                showNotifications ? 'bg-blue-100 text-blue-700 border-2 border-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications ({sampleNotifications.length})
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px]">{unreadNotifications}</Badge>
              )}
            </button>
            <button
              onClick={() => { setShowComments(false); setShowNotifications(false); setShowActivity(true); }}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                showActivity ? 'bg-blue-100 text-blue-700 border-2 border-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="h-4 w-4" />
              Activity ({sampleActivity.length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                {sampleComments.map(comment => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <Badge variant="outline" className="text-xs">{comment.module}</Badge>
                          <Badge variant="secondary" className="text-xs">{comment.item_id}</Badge>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* New Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment... (use @mention to notify team members)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tip: Use @username to mention team members, #WBS-1.1 to link to specific items
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Notifications Section */}
      {showNotifications && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </div>
              {unreadNotifications > 0 && (
                <button className="text-xs text-blue-600 hover:underline">Mark all as read</button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sampleNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${getNotificationColor(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{notif.title}</span>
                        {!notif.read && <Badge className="bg-red-500 text-white text-xs">NEW</Badge>}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{notif.description}</p>
                      <span className="text-xs text-gray-500">{notif.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Section */}
      {showActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Log - Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {sampleActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors">
                  <div className={`${activity.color} mt-0.5`}>{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.actor}</span>
                      {' '}<span className="text-gray-600">{activity.action}</span>
                      {' '}<span className="font-medium">{activity.target}</span>
                    </p>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Online Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Online Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['CEO', 'CTO', 'COO', 'AI Engineer', 'HW Engineer', 'QA/RA'].map((member, idx) => (
              <div key={member} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {member.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${idx < 3 ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium">{member}</p>
                  <p className="text-xs text-gray-500">{idx < 3 ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
