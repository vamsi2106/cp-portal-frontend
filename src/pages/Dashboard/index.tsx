import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpIcon, ArrowDownIcon, UserIcon, TargetIcon, ChartIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Partners', value: 150, icon: UserIcon, trend: 12 },
          { title: 'Active Leads', value: 89, icon: TargetIcon, trend: -5 },
          { title: 'Conversion Rate', value: '24%', icon: ChartIcon, trend: 8 },
          { title: 'Revenue', value: '$12.5k', icon: ChartIcon, trend: 15 },
        ].map((stat, index) => (
          <Card 
            key={index}
            className="hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend > 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(stat.trend)}%
                  </span>
                </div>
              </div>
              <stat.icon className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>
        ))}
      </div>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card 
            title="Partner Performance" 
            className="h-full shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
          >
            <div className="h-[200px] sm:h-[300px] lg:h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
              Chart placeholder
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Recent Activities" 
            className="h-full shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
          >
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">New partner joined</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;