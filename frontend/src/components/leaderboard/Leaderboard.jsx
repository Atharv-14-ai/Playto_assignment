import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/endpoints';
import { FaTrophy, FaCrown, FaMedal, FaChartLine } from 'react-icons/fa';

const Leaderboard = () => {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.feed.getLeaderboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const trophyColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700'];

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Unable to load leaderboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaTrophy className="mr-2 text-yellow-500" />
          Top Contributors
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Last 24h
        </span>
      </div>

      <div className="space-y-4">
        {leaderboard?.data?.map((user, index) => (
          <div
            key={user.user_id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' :
              index === 1 ? 'bg-gray-50 border border-gray-200' :
              index === 2 ? 'bg-amber-50 border border-amber-200' :
              'hover:bg-gray-50 border border-transparent'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700' :
                  index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700' :
                  index === 2 ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700' :
                  'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                }`}>
                  {index < 3 ? (
                    <span className={trophyColors[index]}>
                      {index === 0 ? <FaCrown /> : <FaMedal />}
                    </span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800">{user.username}</div>
                <div className="text-xs text-gray-500">
                  {user.post_likes_24h} post likes • {user.comment_likes_24h} comment likes
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">{user.daily_karma}</div>
              <div className="text-xs text-gray-500">karma</div>
            </div>
          </div>
        ))}

        {(!leaderboard?.data || leaderboard.data.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FaTrophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activity yet. Be the first to earn karma!</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>How it works:</span>
          <span className="font-medium">Post ×5 + Comment ×1</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;