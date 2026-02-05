import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/endpoints';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/feed/CreatePostModal';
import { FaPlus, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const FeedPage = () => {
  const { data: feed, isLoading, error, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: () => api.feed.getFeed(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading community feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load feed</h3>
        <p className="text-gray-600 mb-6">There was an error loading the community feed.</p>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Create post button for mobile */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => document.getElementById('create-post-modal')?.showModal()}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          <FaPlus />
          <span>Create Post</span>
        </button>
      </div>

      {/* Feed header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community Feed</h1>
        <div className="text-sm text-gray-500">
          {feed?.data?.length || 0} posts • Real-time updates
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {feed?.data?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {(!feed?.data || feed.data.length === 0) && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPlus className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share something with the community!</p>
            <button
              onClick={() => document.getElementById('create-post-modal')?.showModal()}
              className="btn-primary"
            >
              Create First Post
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal />
    </div>
  );
};

export default FeedPage;