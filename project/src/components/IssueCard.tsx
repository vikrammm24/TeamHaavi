import React, { useEffect, useState } from 'react';
import { likeReport, unlikeReport, getReportLikes, addReportComment, getReportComments } from '../api/social';
import { rtdb } from './firebase/firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, CheckCircle, AlertTriangle, Pause } from 'lucide-react';
import { useGamification } from '../contexts/gamification/useGamification';
import { useNotifications } from '../contexts/NotificationContext';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: string;
  createdAt: Date;
  assignedTo?: string;
  estimatedCompletion?: Date;
  resolvedAt?: Date;
  likes?: string[];
  comments?: any[];
}

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [likes, setLikes] = useState<string[]>(issue.likes || []);
  const [comments, setComments] = useState<any[]>(issue.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const userId = typeof window !== 'undefined' && window.localStorage.getItem('userId');
  const { awardEvent } = useGamification();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Initial one-time fetch
    getReportLikes(issue.id).then(setLikes);
    getReportComments(issue.id).then(setComments);
    // Live RTDB listeners
    const likesRef = dbRef(rtdb, `reportLikes/${issue.id}`);
    const commentsRef = dbRef(rtdb, `reportComments/${issue.id}`);
    const off1 = onValue(likesRef, (snap) => {
      const v = snap.val();
      setLikes(v ? Object.keys(v) : []);
    });
    const off2 = onValue(commentsRef, (snap) => {
      const v = snap.val();
      setComments(v ? Object.values(v) : []);
    });
    return () => { off1(); off2(); };
  }, [issue.id]);

  const hasLiked = userId && likes.includes(userId);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      if (hasLiked) {
        await unlikeReport(issue.id);
      } else {
        await likeReport(issue.id);
        const res = awardEvent('ISSUE_UPVOTED', { issueId: issue.id });
        if (res) {
          addNotification?.({ type: 'info', title: 'Upvoted', message: `Thanks for supporting! +${res.pointsAwarded} pts.` });
        }
      }
      const updatedLikes = await getReportLikes(issue.id);
      setLikes(updatedLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      await addReportComment(issue.id, commentText.trim());
      setCommentText('');
      const updatedComments = await getReportComments(issue.id);
      setComments(updatedComments);
    } finally {
      setIsCommenting(false);
    }
  };
  const getStatusIcon = () => {
    switch (issue.status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Pause className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (issue.status) {
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getPriorityColor = () => {
    switch (issue.priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h4 className="font-semibold text-gray-800">{issue.title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
            {issue.priority}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {issue.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>

      {/* Likes UI */}
      <div className="flex items-center gap-3 mb-2">
        <button
          className={`px-3 py-1 rounded-full text-xs font-medium border ${hasLiked ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          {hasLiked ? 'Liked' : 'Like'} ({likes.length})
        </button>
      </div>

      {/* Comments UI */}
      <div className="mb-2">
        <div className="font-semibold text-sm mb-1">Comments ({comments.length})</div>
        <div className="space-y-2 mb-2">
          {comments.length === 0 && <div className="text-gray-400 text-xs">No comments yet.</div>}
          {comments.map((c, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg px-3 py-2 text-xs">
              <span className="font-medium text-blue-700">{c.userName || c.userId}</span>: {c.text}
              <span className="ml-2 text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-xs"
            placeholder="Add a comment..."
            disabled={isCommenting}
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium"
            disabled={isCommenting || !commentText.trim()}
          >
            {isCommenting ? '...' : 'Post'}
          </button>
        </form>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>{issue.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Created {formatDate(issue.createdAt)}</span>
          </div>
          {issue.assignedTo && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="text-blue-600 font-medium">{issue.assignedTo}</span>
            </div>
          )}
        </div>
        {issue.estimatedCompletion && issue.status === 'in-progress' && (
          <div className="flex items-center space-x-2 text-blue-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Est. completion: {formatDate(issue.estimatedCompletion)}</span>
          </div>
        )}
        {issue.resolvedAt && issue.status === 'resolved' && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Resolved: {formatDate(issue.resolvedAt)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default IssueCard;