import React, { useEffect } from 'react';
import { Table, Button, Card, Tag } from 'antd';
import { Plus, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchPartners } from '../../redux/slices/partnerSlice';
import type { Partner } from '../../types/partner';

const Partners: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { partners, loading } = useSelector((state: RootState) => state.partner);

    useEffect(() => {
        dispatch(fetchPartners());
    }, [dispatch]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'Name',
            key: 'name',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'Phone_Number',
            key: 'phone',
        },
        {
            title: 'Status',
            key: 'status',
            render: () => (
                <Tag color="green">Active</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Partner) => (
                <Button type="link" onClick={() => console.log('View partner:', record.id)}>
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Partners</h1>
                <Button type="primary" icon={<Plus className="w-4 h-4" />} className="bg-blue-600">
                    Add Partner
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={partners}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default Partners;