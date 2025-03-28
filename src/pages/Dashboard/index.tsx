import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { Users, PhoneCall, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const Dashboard: React.FC = () => {
  const { partners } = useSelector((state: RootState) => state.partner);
  const { leads } = useSelector((state: RootState) => state.lead);

  const stats = [
    {
      title: 'Total Partners',
      value: 5,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: '+12%',
    },
    {
      title: 'Active Leads',
      value: 20,
      icon: <PhoneCall className="w-6 h-6 text-green-600" />,
      trend: '+5%',
    },
    {
      title: 'Conversion Rate',
      value: '24%',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      trend: '+8%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">{stat.title}</p>
                    <Statistic value={stat.value} />
                    <span className="text-green-600 text-sm">{stat.trend} from last month</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-full">{stat.icon}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Partner Performance" className="h-full">
            {/* Add chart component here */}
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
              Chart placeholder
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Activities" className="h-full">
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-600" />
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