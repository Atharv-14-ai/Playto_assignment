import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Leaderboard from '../components/leaderboard/Leaderboard';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <main className="lg:w-2/3">
            <Outlet />
          </main>
          
          {/* Sidebar with leaderboard */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8">
              <Leaderboard />
              <div className="mt-6 card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How Karma Works</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">+5</span>
                    </div>
                    <span>Post like = 5 karma</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">+1</span>
                    </div>
                    <span>Comment like = 1 karma</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">🏆</span>
                    </div>
                    <span>Leaderboard updates every 24h</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;