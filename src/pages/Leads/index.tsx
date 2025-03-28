// import React, { useEffect } from 'react';
// import { Tree, Card, Spin, Alert } from 'antd';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../redux/store';
// import { fetchLeadHierarchy } from '../../redux/slices/leadSlice';
// import { PhoneCall, User } from 'lucide-react';

// const LeadHierarchy: React.FC<{ partnerId: string }> = ({ partnerId }) => {
//     const dispatch = useDispatch<AppDispatch>();
//     const { hierarchy, loading, error }: any = useSelector((state: RootState) => state.lead);
//     const { user }: any = useSelector((state: RootState) => state.auth);

//     useEffect(() => {
//         dispatch(fetchLeadHierarchy(user.id));
//     }, [dispatch, partnerId]);

//     // Recursive function to transform API data into Antd Tree structure
//     const transformHierarchy: any = (partners: any[]) => {
//         return partners.map((partner) => {
//             const partnerNode = {
//                 title: (
//                     <div className="flex items-center space-x-2">
//                         <User className="w-4 h-4 text-blue-600" />
//                         <span className="font-semibold">{partner.partnerName}</span>
//                         <span className="text-gray-500 text-sm">({partner.Phone_Number})</span>
//                     </div>
//                 ),
//                 key: partner.partnerId,
//                 children: [
//                     ...partner.leads.map((lead: any) => ({
//                         title: (
//                             <div className="flex items-center space-x-2">
//                                 <PhoneCall className="w-4 h-4 text-green-600" />
//                                 <span className="text-md">{lead.LeadName}</span>
//                                 <span className="text-gray-500 text-sm">({lead.Phone_Number})</span>
//                             </div>
//                         ),
//                         key: lead.id,
//                     })),
//                     ...transformHierarchy(partner.subPartners),
//                 ],
//             };
//             return partnerNode;
//         });
//     };

//     return (
//         <Card title="Lead Hierarchy">
//             {loading && <Spin />}
//             {error && <Alert type="error" message={error} />}
//             {hierarchy && (
//                 <Tree
//                     defaultExpandAll
//                     treeData={transformHierarchy(hierarchy)}
//                     showLine={{ showLeafIcon: false }}
//                 />
//             )}
//         </Card>
//     );
// };

// export default LeadHierarchy;


import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, message, Spin, Tabs } from 'antd';
import { Plus, PhoneCall } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchLeadHierarchy } from '../../redux/slices/leadSlice';
import { api } from '../../api/api';
import LeadHierarchyTree from './LeadHierarchyTree';
import TabPane from 'antd/es/tabs/TabPane';

// Flatten the nested lead structure
const flattenLeads = (data: any[]): any[] => {
    const flattened: any[] = [];

    const flatten = (partners: any[]) => {
        partners.forEach(partner => {
            // Add leads directly under the partner
            partner.leads.forEach((lead: any) => {
                flattened.push({
                    ...lead,
                    partnerName: partner.partnerName,
                });
            });

            // Recursively flatten sub-partners
            if (partner.subPartners && partner.subPartners.length > 0) {
                flatten(partner.subPartners);
            }
        });
    };

    flatten(data);
    return flattened;
};

const Leads: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, hierarchy }: any = useSelector((state: RootState) => state.lead);
    const { user }: any = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('list');
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchLeadHierarchy(user?.id));
        }
    }, [dispatch, user?.id]);

    const columns = [
        {
            title: 'Lead Name',
            dataIndex: 'LeadName',
            key: 'name',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <PhoneCall className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Phone Number',
            dataIndex: 'Phone_Number',
            key: 'phone'
        },
        {
            title: 'Partner',
            dataIndex: 'partnerName',
            key: 'partner'
        },
        {
            title: 'Owner',
            dataIndex: ['Owner', 'name'],
            key: 'owner',
            render: (text: string) => text || '—'
        },
        {
            title: 'Status',
            key: 'status',
            render: () => <Tag color="green">Active</Tag>
        },
    ];

    const handleAddLead = async (values: any) => {
        const payload = {
            ...values,
            Owner: user.id, // Assign current user as owner
        };

        try {
            const response: any = await api.post('/api/leads', payload);

            if (response.error) {
                message.error(response.error);
            } else {
                message.success('Lead created successfully');
                setModalVisible(false);
                form.resetFields();
                dispatch(fetchLeadHierarchy(user.id));
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to create lead');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    className="bg-green-600"
                    onClick={() => setModalVisible(true)}
                >
                    Add Lead
                </Button>
            </div>

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Leads List" key="list">
                        <Table
                            columns={columns}
                            dataSource={hierarchy ? flattenLeads(hierarchy) : []}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>

                    <TabPane tab="Hierarchy View" key="hierarchy">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <LeadHierarchyTree data={hierarchy} />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Add New Lead"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddLead}>
                    <Form.Item name="LeadName" label="Lead Name" rules={[{ required: true, min: 3 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Phone_Number" label="Phone Number" rules={[{ required: true, pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }]}>
                        <Input />
                    </Form.Item>
                    <div className="flex justify-end space-x-2">
                        <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Create</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Leads;