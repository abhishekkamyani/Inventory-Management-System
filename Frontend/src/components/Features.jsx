import React from 'react';
import { FaRegDotCircle, FaRegFileAlt, FaSyncAlt } from 'react-icons/fa'; // Importing some icons from react-icons

const Features = () => {
  const features = [
    { 
      title: 'Real-Time Inventory Tracking', 
      description: 'Monitor stock levels and track inventory movements instantly.',
      icon: <FaSyncAlt className="text-4xl text-blue-900" /> // Icon for real-time tracking
    },
    { 
      title: 'Automated Requisition Process', 
      description: 'Submit and approve requisitions seamlessly through the system.',
      icon: <FaRegDotCircle className="text-4xl text-blue-900" /> // Icon for requisition
    },
    { 
      title: 'Comprehensive Reporting', 
      description: 'Generate detailed reports for better decision-making.',
      icon: <FaRegFileAlt className="text-4xl text-blue-900" /> // Icon for reports
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Key Features</h2>
        <p className="mt-4 text-lg text-gray-600">Empowering you to manage inventory with ease and precision.</p>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                {feature.icon} {/* Displaying the icon */}
              </div>
              <h3 className="text-lg font-semibold text-blue-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
