import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import CommentItem from './CommentItem';

const CommentSection = ({ postId, comments: initialComments }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => api.feed.createComment(commentData),
    onSuccess: () => {
      toast.success('Comment posted!');
      setNewComment('');
      setReplyingTo(null);
      queryClient.invalidateQueries(['feed']);
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const commentData = {
      post: postId,
      content: newComment,
      parent: replyingTo,
    };

    createCommentMutation.mutate(commentData);
  };

  // Function to render comments recursively
  const renderComments = (comments, depth = 0) => {
    if (!comments || comments.length === 0) return null;

    return comments.map((comment) => (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        <CommentItem
          comment={comment}
          depth={depth}
          onReply={() => setReplyingTo(comment.id)}
        />
        {comment.replies && renderComments(comment.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div>
      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-playto-blue to-playto-purple rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo 
                    ? `Replying to comment...` 
                    : 'Add a comment...'
                }
                className="textarea textarea-bordered w-full resize-none min-h-[80px]"
                maxLength={2000}
              />
              {replyingTo && (
                <div className="text-sm text-gray-500 mt-1">
                  Replying to comment • 
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {newComment.length}/2000 characters
                  <span className="ml-2 text-playto-green font-medium">+1 karma per like</span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={createCommentMutation.isLoading || !newComment.trim()}
                >
                  {createCommentMutation.isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-600">
            Please <a href="/login" className="text-blue-500 hover:underline">login</a> to comment
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {renderComments(initialComments || [])}
        
        {(!initialComments || initialComments.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;