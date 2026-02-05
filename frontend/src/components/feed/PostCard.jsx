import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaComment, FaShare, FaEllipsisH, FaTrash, FaEdit } from 'react-icons/fa';
import CommentSection from '../comments/CommentSection';
import api from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => api.feed.likePost(post.id),
    onMutate: async () => {
      setIsLiking(true);
      await queryClient.cancelQueries(['feed']);
      
      const previousFeed = queryClient.getQueryData(['feed']);
      
      queryClient.setQueryData(['feed'], (old) => {
        return {
          ...old,
          data: old.data.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                like_count: p.has_liked ? p.like_count - 1 : p.like_count + 1,
                has_liked: !p.has_liked,
              };
            }
            return p;
          }),
        };
      });

      return { previousFeed };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['feed'], context.previousFeed);
      toast.error('Failed to like post');
    },
    onSettled: () => {
      setIsLiking(false);
      queryClient.invalidateQueries(['feed']);
    },
  });

  const handleLike = () => {
    if (isLiking) return;
    likeMutation.mutate();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.feed.deletePost(post.id);
        toast.success('Post deleted');
        queryClient.invalidateQueries(['feed']);
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <div className="card mb-6 hover:shadow-lg transition-shadow">
      {/* Post header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-playto-blue to-playto-purple rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{post.author.username}</div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              {post.author.profile?.total_karma && (
                <span className="ml-2 text-playto-green font-medium">
                  • {post.author.profile.total_karma} karma
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-sm">
              <FaEllipsisH className="text-gray-400" />
            </button>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
              <li><button><FaEdit /> Edit</button></li>
              <li><button onClick={handleDelete} className="text-red-600"><FaTrash /> Delete</button></li>
            </ul>
          </div>
        )}
      </div>

      {/* Post content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              post.has_liked ? 'text-red-500' : 'hover:text-red-500'
            } transition-colors ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLiking}
          >
            <FaHeart className={post.has_liked ? 'fill-current' : ''} />
            <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
          >
            <FaComment />
            <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>
        <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
          <FaShare />
          <span>Share</span>
        </button>
      </div>

      {/* Comment section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      )}
    </div>
  );
};

export default PostCard;