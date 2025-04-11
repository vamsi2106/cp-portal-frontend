import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Avatar, Tabs, Tag, Table, Button, Skeleton, Dropdown } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import {
    fetchUserProfile,
    fetchPartnerActivity,
    fetchLeadStatus
} from '../../redux/slices/profileSlice';
import {
    User, Mail, Phone, Clock, MapPin, Activity,
    Award, Settings, MoreHorizontal, Edit, FileText, Download
} from 'lucide-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface LeadData {
    key: string;
    name: string;
    status: string;
    company: string;
    date: string;
}

interface PartnerActivity {
    key: string;
    activity: string;
    date: string;
    leadName?: string;
    details: string;
}

const Profile = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { profile, partnerActivity, leadStatus, loading } = useSelector((state: RootState) => state.profile);
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchUserProfile(user.id));
            dispatch(fetchPartnerActivity(user.id));
            dispatch(fetchLeadStatus(user.id));
        }
    }, [dispatch, user?.id]);

    const leadColumns = [
        {
            title: 'Lead Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: LeadData, b: LeadData) => a.name.localeCompare(b.name),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    'New Lead': 'gold',
                    'Contacted': 'blue',
                    'Qualified': 'cyan',
                    'Proposal': 'purple',
                    'Negotiation': 'geekblue',
                    'Won': 'green',
                    'Lost': 'red',
                };
                return <Tag color={statusColors[status] || 'default'}>{status}</Tag>;
            },
            filters: [
                { text: 'New Lead', value: 'New Lead' },
                { text: 'Contacted', value: 'Contacted' },
                { text: 'Qualified', value: 'Qualified' },
                { text: 'Proposal', value: 'Proposal' },
                { text: 'Negotiation', value: 'Negotiation' },
                { text: 'Won', value: 'Won' },
                { text: 'Lost', value: 'Lost' },
            ],
            onFilter: (value: string | number | boolean, record: LeadData) => record.status === value,
        },
        {
            title: 'Company',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a: LeadData, b: LeadData) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: '1',
                                label: 'View Details',
                                icon: <FileText className="w-4 h-4 mr-2" />,
                            },
                            {
                                key: '2',
                                label: 'Edit Lead',
                                icon: <Edit className="w-4 h-4 mr-2" />,
                            },
                            {
                                key: '3',
                                label: 'Download Info',
                                icon: <Download className="w-4 h-4 mr-2" />,
                            },
                        ],
                    }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Button type="text" icon={<MoreHorizontal className="w-4 h-4" />} />
                </Dropdown>
            ),
        },
    ];

    const activityColumns = [
        {
            title: 'Activity',
            dataIndex: 'activity',
            key: 'activity',
        },
        {
            title: 'Lead',
            dataIndex: 'leadName',
            key: 'leadName',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a: PartnerActivity, b: PartnerActivity) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                <Card className="rich-card-dark">
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
                <Card className="rich-card">
                    <Skeleton active paragraph={{ rows: 8 }} />
                </Card>
            </div>
        );
    }

    // Placeholder data for demonstration
    const leadData: LeadData[] = leadStatus?.map((lead: any, index: number) => ({
        key: index.toString(),
        name: lead.leadName,
        status: lead.status,
        company: lead.companyName,
        date: lead.date,
    })) || [];

    const activityData: PartnerActivity[] = partnerActivity?.map((activity: any, index: number) => ({
        key: index.toString(),
        activity: activity.action,
        leadName: activity.leadName,
        details: activity.details,
        date: activity.date,
    })) || [];

    return (
        <div className="space-y-4">
            {/* Profile Header */}
            <div className="rich-card-dark p-6 rounded-lg">
                <div className="rich-card-pattern"></div>
                <div className="relative z-10">
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} md={4} className="flex justify-center md:justify-start">
                            <Avatar
                                size={100}
                                src={profile?.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'}
                                className="border-4 border-primary-gold shadow-lg"
                            />
                        </Col>
                        <Col xs={24} md={14}>
                            <Title level={4} className="text-white m-0 text-center md:text-left">{profile?.name || 'Partner Name'}</Title>
                            <div className="mt-3 space-y-2 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start text-secondary-cream">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <Text className="text-secondary-cream">{profile?.email || 'partner@example.com'}</Text>
                                </div>
                                <div className="flex items-center justify-center md:justify-start text-secondary-cream">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <Text className="text-secondary-cream">{profile?.phone || '+1 (555) 123-4567'}</Text>
                                </div>
                                <div className="flex items-center justify-center md:justify-start text-secondary-cream">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <Text className="text-secondary-cream">{profile?.location || 'San Francisco, CA'}</Text>
                                </div>
                                <div className="flex items-center justify-center md:justify-start text-secondary-cream">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <Text className="text-secondary-cream">Joined {profile?.joinDate || 'Jan 2023'}</Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={6}>
                            <div className="flex flex-col items-center md:items-end space-y-3">
                                <div className="bg-[#1c3141] px-4 py-2 rounded-full text-primary-gold flex items-center">
                                    <Award className="w-4 h-4 mr-2" />
                                    <span>{profile?.partnerTier || 'Gold Partner'}</span>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="text-white text-lg font-semibold">{profile?.leadCount || '0'}</div>
                                    <div className="text-secondary-cream text-xs">Total Leads</div>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="text-white text-lg font-semibold">{profile?.conversionRate || '0%'}</div>
                                    <div className="text-secondary-cream text-xs">Conversion Rate</div>
                                </div>
                                <Button
                                    icon={<Edit className="w-4 h-4" />}
                                    className="mt-2 bg-[#1c3141] text-primary-gold border border-primary-gold hover:bg-primary-gold hover:text-[#132430]"
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Profile Content */}
            <Card
                className="rich-card"
                tabList={[
                    {
                        key: '1',
                        tab: (
                            <span className="flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Activity
                            </span>
                        ),
                    },
                    {
                        key: '2',
                        tab: (
                            <span className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Leads
                            </span>
                        ),
                    },
                    {
                        key: '3',
                        tab: (
                            <span className="flex items-center">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </span>
                        ),
                    },
                ]}
                activeTabKey={activeTab}
                onTabChange={setActiveTab}
            >
                <div className="rich-card-pattern" style={{ opacity: 0.01 }}></div>
                <div className="relative z-10">
                    {activeTab === '1' && (
                        <Table
                            className="dark-table"
                            columns={activityColumns}
                            dataSource={activityData}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: 'No activities found' }}
                        />
                    )}
                    {activeTab === '2' && (
                        <Table
                            className="dark-table"
                            columns={leadColumns}
                            dataSource={leadData}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: 'No leads found' }}
                        />
                    )}
                    {activeTab === '3' && (
                        <div className="p-4">
                            <Title level={5}>Account Settings</Title>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <Text strong>Profile Visibility</Text>
                                    <div className="mt-2">
                                        <Button type="primary" className="mr-2">Public</Button>
                                        <Button>Private</Button>
                                    </div>
                                </div>
                                <div>
                                    <Text strong>Notification Preferences</Text>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <Text>Email Notifications</Text>
                                            <Button type="primary">Enabled</Button>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <Text>Lead Status Updates</Text>
                                            <Button type="primary">Enabled</Button>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <Text>Weekly Reports</Text>
                                            <Button>Disabled</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button type="primary" className="mr-2">Save Changes</Button>
                                    <Button>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Profile; 