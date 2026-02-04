import React from 'react';
import Header from '../components/dashboard/Header';
import MainStage from '../components/dashboard/MainStage';
import NewsFeed from '../components/dashboard/NewsFeed';

const Dashboard = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-100">
      {/* Zone C: Header */}
      <div className="flex-none z-50 relative">
        <Header />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone A: Main Stage */}
        <div className="w-3/4 h-full relative z-0">
          <MainStage />
        </div>

        {/* Zone B: News Feed */}
        <div className="w-1/4 h-full relative z-10 shadow-[-5px_0_15px_rgba(0,0,0,0.1)]">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
