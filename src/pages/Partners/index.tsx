import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tabs, Spin, Modal, Form, Input, message, Select } from 'antd';
import { Plus, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchPartnerHierarchy } from '../../redux/slices/partnerSlice';
import { api } from '../../api/api';
import PartnerHierarchyTree from './PartnerHierarchyTree';
import flattenPartners from '../../helpers/partners';

const { TabPane } = Tabs;
const { Option } = Select;

const Partners: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, hierarchy }: any = useSelector((state: RootState) => state.partner);
    const { user }: any = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('list');
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');


    useEffect(() => {
        if (user?.id) {
            dispatch(fetchPartnerHierarchy(user?.id));
        }
    }, [dispatch, user?.id]);

    useEffect(() => {
        if (modalVisible && user?.id) {
            form.setFieldsValue({ Parent_Partner: user?.name });
        } else {
            form.setFieldsValue({ Parent_Partner: undefined });
        }
    }, [modalVisible, user?.id, user?.name, form]);

    const filteredHierarchy = React.useMemo(() => {
        if (!hierarchy) return [];
        const flattened = flattenPartners(hierarchy);
        return flattened.filter(partner => {
            const nameMatch = searchText ? partner.Name.toLowerCase().includes(searchText.toLowerCase()) : true;
            const statusMatch = statusFilter ? partner.Status === statusFilter : true;
            return nameMatch && statusMatch;
        });
    }, [hierarchy, searchText, statusFilter]);


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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <div
                  tabIndex={0}
                  role="menu"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      confirm();
                    }
                  }}
                >
                  <Input.Search
                    placeholder="Search name..."
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    onBlur={() => confirm()}
                  />
                </div>
              ),
              onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                 
                }
              },
              onFilter: (value, record) =>
                record.Name.toLowerCase().includes(value.toLowerCase()),
              filterIcon: () => <SearchOutlined style={{ fontSize: 12 }} />,
              onFilter: (value, record) => record.Name.toLowerCase().includes(value.toLowerCase()),
        },
        { title: 'Email', dataIndex: 'Email', key: 'email' },
        { title: 'Phone', dataIndex: 'Phone_Number', key: 'phone' },
        {
            title: 'Reporting To',
            dataIndex: ['Parent_Partner', 'name'],
            key: 'reportingTo',
            render: (text: string) => text ? text : user?.parentPartner?.name || '—',
        },
        { title: 'Status', key: 'status', render: (text:string) => <Tag color="green">{text}</Tag> , filters: [{ text: 'Active', value: 'Active' }, { text: 'Inactive', value: 'Inactive' }], onFilter: (value, record) => record.Status === value },
    ];

    const handleAddPartner = async (values: any) => {
        const payload = {
            ...values,
            Parent_Partner: user.id,
        };

        try {
            const response: any = await api.post('/api/partners', payload);

            if (response.error) {
                message.error(response.error);
            } else {
                message.success('Partner created successfully');
                setModalVisible(false);
                form.resetFields();
                dispatch(fetchPartnerHierarchy(user.id));
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Failed to create partner');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Partners</h1>
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    className="bg-blue-600"
                    onClick={() => setModalVisible(true)}
                >
                    Add Partner
                </Button>
            </div>

            <Card className="overflow-hidden">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="w-full overflow-x-auto min-w-[300px]"
                    type="card"
                >
                    <TabPane tab="List View" key="list">
                        <div className="mb-4 flex flex-wrap gap-4">
                            <Input.Search
                                placeholder="Search partners..."
                                allowClear
                                className="w-full sm:w-64"
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Select
                                placeholder="Filter by status"
                                className="w-full sm:w-40"
                                allowClear
                                onChange={setStatusFilter}
                            >
                                <Option value="Active">Active</Option>
                                <Option value="Inactive">Inactive</Option>
                            </Select>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <Table
                                    columns={columns}
                                    dataSource={filteredHierarchy}
                                    scroll={{ x: 'max-content' }}
                                    className="min-w-[600px]"
                                    size="middle"
                                    loading={loading}
                                    rowKey="id"
                                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} partners` }}
                                />
                            </div>
                        )}
                    </TabPane>

                    <TabPane tab="Hierarchy View" key="hierarchy">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <PartnerHierarchyTree data={hierarchy} />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Add New Partner"
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddPartner}>
                    <Form.Item name="Name" label="Name" rules={[{ required: true, min: 3 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Phone_Number" label="Phone Number" rules={[{ required: true, pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Parent_Partner" label="Parent Partner">
                        <Input disabled style={{ color: 'black' }} />
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

export default Partners;