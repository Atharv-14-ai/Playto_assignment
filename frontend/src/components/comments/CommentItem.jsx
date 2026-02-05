import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaReply, FaEllipsisH, FaTrash } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, depth, onReply }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => api.feed.likeComment(comment.id),
    onMutate: async () => {
      setIsLiking(true);
      // Optimistic update logic would go here
    },
    onError: () => {
      toast.error('Failed to like comment');
    },
    onSettled: () => {
      setIsLiking(false);
      queryClient.invalidateQueries(['feed']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.feed.deleteComment(comment.id),
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries(['feed']);
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const handleLike = () => {
    if (isLiking) return;
    likeMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate();
    }
  };

  const isAuthor = user?.id === comment.author.id;
  const maxDepth = 5; // Maximum nesting depth
  const shouldIndent = depth > 0 && depth < maxDepth;

  return (
    <div className={`${shouldIndent ? 'pl-4 border-l-2 border-gray-200' : ''} py-3`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-playto-blue to-playto-purple rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {comment.author.username?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800">{comment.author.username}</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.author.profile?.total_karma && (
                <span className="text-xs text-playto-green font-medium">
                  {comment.author.profile.total_karma} karma
                </span>
              )}
            </div>
            
            {/* Actions dropdown */}
            {(isAuthor || user?.is_staff) && (
              <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-xs">
                  <FaEllipsisH className="text-gray-400" />
                </button>
                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                  <li><button onClick={handleDelete} className="text-red-600"><FaTrash /> Delete</button></li>
                </ul>
              </div>
            )}
          </div>

          {/* Comment text */}
          <div className="mb-2">
            <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                comment.has_liked ? 'text-red-500' : 'hover:text-red-500'
              } transition-colors ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLiking}
            >
              <FaHeart className={comment.has_liked ? 'fill-current' : ''} />
              <span>{comment.like_count}</span>
            </button>
            
            {depth < maxDepth - 1 && (
              <button
                onClick={onReply}
                className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
              >
                <FaReply />
                <span>Reply</span>
              </button>
            )}
            
            {depth >= maxDepth - 1 && (
              <span className="text-xs text-gray-400">
                Thread too deep - reply disabled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;