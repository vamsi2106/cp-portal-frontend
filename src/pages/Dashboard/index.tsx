
import React from 'react';
import { Card, Row, Col, Statistic, Progress, List } from 'antd';
import { Chart } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { hierarchy } = useSelector((state: RootState) => state.lead);
  
  const calculateStats = () => {
    let totalPartners = 0;
    let totalLeads = 0;
    let activePartners = 0;
    
    const processNode = (node: any) => {
      totalPartners++;
      totalLeads += node.leads?.length || 0;
      if (node.leads?.length > 0) activePartners++;
      
      node.subPartners?.forEach(processNode);
    };
    
    hierarchy?.forEach(processNode);
    
    return { totalPartners, totalLeads, activePartners };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-lg transition-shadow">
            <Statistic 
              title="Total Partners" 
              value={stats.totalPartners}
              prefix={<Users className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-lg transition-shadow">
            <Statistic 
              title="Total Leads" 
              value={stats.totalLeads}
              prefix={<Target className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-lg transition-shadow">
            <Statistic 
              title="Active Partners" 
              value={stats.activePartners}
              prefix={<Award className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-lg transition-shadow">
            <Statistic 
              title="Conversion Rate" 
              value={((stats.totalLeads / stats.totalPartners) * 100).toFixed(1)}
              suffix="%"
              prefix={<TrendingUp className="text-orange-500" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Performing Partners" bordered={false}>
            <List
              dataSource={hierarchy?.flatMap(node => getAllPartners(node))
                .sort((a, b) => (b.leads?.length || 0) - (a.leads?.length || 0))
                .slice(0, 5)}
              renderItem={partner => (
                <List.Item>
                  <List.Item.Meta
                    title={partner.partnerName}
                    description={`${partner.leads?.length || 0} leads`}
                  />
                  <Progress 
                    percent={partner.leads?.length ? (partner.leads.length / stats.totalLeads) * 100 : 0} 
                    strokeColor="#4CAF50"
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Partner Network Growth" bordered={false}>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Partners',
                      data: hierarchy?.flatMap(node => getAllPartners(node)).length || [],
                      borderColor: '#DAA520',
                      tension: 0.4,
                    }
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const getAllPartners = (node: any): any[] => {
  const partners = [node];
  node.subPartners?.forEach((partner: any) => {
    partners.push(...getAllPartners(partner));
  });
  return partners;
};

export default Dashboard;
