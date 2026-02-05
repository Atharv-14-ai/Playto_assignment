import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/endpoints';
import toast from 'react-hot-toast';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const CreatePostModal = () => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (postData) => api.feed.createPost(postData),
    onSuccess: () => {
      toast.success('Post created successfully!');
      setContent('');
      document.getElementById('create-post-modal')?.close();
      queryClient.invalidateQueries(['feed']);
    },
    onError: () => {
      toast.error('Failed to create post');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    createPostMutation.mutate({ content });
  };

  return (
    <dialog id="create-post-modal" className="modal">
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <FaTimes />
          </button>
        </form>
        
        <h3 className="font-bold text-lg mb-6">Create New Post</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts with the community..."
              className="textarea textarea-bordered w-full h-48 text-lg resize-none"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {content.length}/5000 characters
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-playto-green">+5 karma</span> for each post like
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FaPaperPlane />
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default CreatePostModal;