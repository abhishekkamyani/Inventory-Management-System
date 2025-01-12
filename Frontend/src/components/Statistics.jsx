import React from 'react';

const Statistics = () => {
  const stats = [
    { label: 'Departments Covered', value: '20+' },
    { label: 'Assets Tracked', value: '1,500+' },
    { label: 'System Uptime', value: '99.9%' },
  ];

  return (
    <div className="bg-blue-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
