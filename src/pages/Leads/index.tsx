import React, { useEffect } from 'react';
import { Table, Button, Card, Tag } from 'antd';
import { Plus, PhoneCall } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchLeads } from '../../redux/slices/leadSlice';
import type { Lead } from '../../types/lead';

const Leads: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { leads, loading } = useSelector((state: RootState) => state.lead);

    useEffect(() => {
        dispatch(fetchLeads());
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            New: 'blue',
            'In Progress': 'orange',
            Converted: 'green',
            Lost: 'red',
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Lead Name',
            dataIndex: 'LeadName',
            key: 'name',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <PhoneCall className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'Phone_Number',
            key: 'phone',
        },
        {
            title: 'Status',
            dataIndex: 'Lead_Status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
        },
        {
            title: 'Associated Partner',
            dataIndex: ['Associated_Partner', 'name'],
            key: 'partner',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Lead) => (
                <Button type="link" onClick={() => console.log('View lead:', record.id)}>
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                <Button type="primary" icon={<Plus className="w-4 h-4" />} className="bg-blue-600">
                    Add Lead
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={leads}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default Leads;