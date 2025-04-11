import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Tabs, Spin, Modal, Form, Input, message, Select, TreeSelect, Typography, Drawer, Space, Collapse, List, Avatar } from 'antd';
import { Plus, Users, Search, Filter, PhoneCall as Phone, Mail, X, UserCheck, User, Building, Briefcase, ChevronDown, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchPartnerHierarchy, addPartnerOptimistically } from '../../redux/slices/partnerSlice';
import { api } from '../../api/api';
import PartnerHierarchyTree from '../../components/PartnerHierarchyTree';
import flattenPartners from '../../helpers/partners';

const { Panel } = Collapse;

// Define these locally to fix type errors
interface Partner {
    id: string;
    Name: string;
    Email: string | null;
    Phone_Number: string;
    Organization_Name?: string;
    Reporting_To_Partner: { name: string, id: string | number };
    Sub_Partners: Partner[];
}

interface FlattenedPartner {
    id: string;
    Name: string;
    Phone_Number: string;
    Email: string;
    Organization_Name?: string;
    Reporting_To_Partner?: { name: string, id: string | number } | {};
}


interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
    Reporting_To_Partner?: {
        name: string;
    };
}

interface ApiResponse {
    data: {
        success: boolean;
        message?: string;
        data?: any;
    };
}

// Add a PartnerCard component for mobile view
const PartnerCard: React.FC<{ partner: FlattenedPartner; parentName?: string }> = ({ partner, parentName }) => {
    return (
        <Card
            className="mb-3 border border-gray-100 rounded-xl overflow-hidden hover:border-[#DAA520]/30 transition-all"
            bodyStyle={{ padding: 0 }}
            styles={{ body: { padding: 0 } }}
        >
            <div className="flex flex-col">
                {/* Card Header */}
                <div className="bg-[#f6f4ef] py-2.5 px-3 border-b border-gray-100 flex items-center">
                    <div
                        className="w-9 h-9 rounded-lg mr-3 flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(204,169,90,0.15) 0%, rgba(204,169,90,0.3) 100%)',
                        }}
                    >
                        <Users className="w-4 h-4 text-[#DAA520]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[#132430] font-semibold text-sm truncate m-0">{partner.Name}</h3>
                        {partner.Organization_Name && (
                            <div className="text-xs text-[#132430]/70 truncate">
                                {partner.Organization_Name}
                            </div>
                        )}
                    </div>
                    {/* Partner type badge */}
                    <div
                        className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                            backgroundColor: 'rgba(204,169,90,0.1)',
                            color: '#C89932',
                            border: '1px solid rgba(204,169,90,0.2)'
                        }}
                    >
                        {partner.Organization_Name ? 'Company' : 'Individual'}
                    </div>
                </div>

                {/* Card Content */}
                <div className="px-3 py-2.5">
                    <div className="grid grid-cols-1 gap-2.5">
                        {partner.Phone_Number && (
                            <a
                                href={`tel:${partner.Phone_Number}`}
                                className="flex items-center text-gray-700 hover:text-[#DAA520] active:bg-gray-50 rounded-md p-1 -ml-1"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-7 h-7 bg-[#f6f4ef] rounded-full flex items-center justify-center mr-2.5">
                                    <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                                </div>
                                <span className="text-sm truncate">{partner.Phone_Number}</span>
                            </a>
                        )}

                        {partner.Email && (
                            <a
                                href={`mailto:${partner.Email}`}
                                className="flex items-center text-gray-700 hover:text-[#DAA520] active:bg-gray-50 rounded-md p-1 -ml-1"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-7 h-7 bg-[#f6f4ef] rounded-full flex items-center justify-center mr-2.5">
                                    <Mail className="w-3.5 h-3.5 text-[#DAA520]" />
                                </div>
                                <span className="text-sm truncate">{partner.Email}</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Card Footer */}
                {((partner.Reporting_To_Partner && 'name' in partner.Reporting_To_Partner && partner.Reporting_To_Partner.name) || parentName) && (
                    <div className="bg-[#f6f4ef]/50 px-3 py-2 border-t border-gray-100 flex items-center text-xs text-gray-600">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5 text-[#DAA520]/70" />
                        <span className="truncate">
                            Reports to: {(partner.Reporting_To_Partner && 'name' in partner.Reporting_To_Partner)
                                ? partner.Reporting_To_Partner.name
                                : parentName || 'Unknown'}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
};

const Partners: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, hierarchy } = useSelector((state: RootState) => state.partner) as {
        loading: boolean;
        hierarchy: Partner | null;
    };
    const { user } = useSelector((state: RootState) => state.auth) as { user: User | null };

    const [statusFilter, setStatusFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedParent, setSelectedParent] = useState<string | null>(null);
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        phone: '',
        email: '',
        parent: null as string | null
    });
    const [isAddingPartner, setIsAddingPartner] = useState(false);
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);
    const [manuallyAddedPartners, setManuallyAddedPartners] = useState<FlattenedPartner[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState('list');

    useEffect(() => {
        // Check if we're on mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchPartnerHierarchy(user.id));
        }
    }, [dispatch, user?.id]);

    // Function to convert hierarchy to TreeSelect data
    const convertToTreeData: any = (partner: Partner) => {
        return {
            title: partner.Name,
            value: partner.id,
            children: partner.Sub_Partners?.map(convertToTreeData) || []
        };
    };

    // Get all partners under a specific parent
    const getPartnersUnderParent = (partner: Partner, parentId: string | null): FlattenedPartner[] => {
        if (!parentId) return flattenPartners(partner);

        if (partner.id === parentId) {
            return flattenPartners(partner);
        }

        if (partner.Sub_Partners) {
            for (const subPartner of partner.Sub_Partners) {
                const result = getPartnersUnderParent(subPartner, parentId);
                if (result.length > 0) return result;
            }
        }
        return [];
    };

    const partnersList = React.useMemo(() => {
        if (!hierarchy) return [];
        return [...getPartnersUnderParent(hierarchy, selectedParent), ...manuallyAddedPartners];
    }, [hierarchy, selectedParent, manuallyAddedPartners]);

    // Filter partners based on search criteria
    const filteredPartners = React.useMemo(() => {
        const filtered = partnersList.filter(partner => {
            const matchesName = !searchFilters.name ||
                partner.Name.toLowerCase().includes(searchFilters.name.toLowerCase());
            const matchesPhone = !searchFilters.phone ||
                partner.Phone_Number.includes(searchFilters.phone);
            const matchesEmail = !searchFilters.email ||
                partner.Email.toLowerCase().includes(searchFilters.email.toLowerCase());
            return matchesName && matchesPhone && matchesEmail;
        });
        console.log('Filtered partners with organization data:', filtered);
        return filtered;
    }, [partnersList, searchFilters]);

    const clearFilters = () => {
        setSearchFilters({ name: '', phone: '', email: '', parent: null });
        setSelectedParent(null);
        setStatusFilter('');
        if (isMobile) {
            setFilterDrawerOpen(false);
        }
    };

    // Search and filters component for both desktop and mobile
    const SearchAndFilters = () => (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-[#DAA520]" />
                <h3 className="text-lg font-semibold text-[#132430]">Search & Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#132430]">Search by Name</label>
                    <Input.Search
                        placeholder="Enter partner name..."
                        allowClear
                        className="w-full"
                        value={searchFilters.name}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                        prefix={<Users className="w-4 h-4 text-gray-400" />}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#132430]">Search by Phone</label>
                    <Input.Search
                        placeholder="Enter phone number..."
                        allowClear
                        className="w-full"
                        value={searchFilters.phone}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, phone: e.target.value }))}
                        prefix={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#132430]">Search by Email</label>
                    <Input.Search
                        placeholder="Enter email address..."
                        allowClear
                        className="w-full"
                        value={searchFilters.email}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, email: e.target.value }))}
                        prefix={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#132430]">Select Parent Partner</label>
                    <TreeSelect
                        placeholder="Choose parent partner..."
                        allowClear
                        className="w-full"
                        treeData={hierarchy ? [convertToTreeData(hierarchy)] : []}
                        onChange={(value) => {
                            setSelectedParent(value);
                            setSearchFilters(prev => ({ ...prev, parent: value }));
                        }}
                        treeIcon
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        value={selectedParent}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
                <Button
                    type="default"
                    onClick={clearFilters}
                    icon={<X className="w-4 h-4" />}
                    className="border-[#DAA520] text-[#DAA520] hover:text-[#C89932] hover:border-[#C89932]"
                >
                    Clear All
                </Button>
            </div>
        </div>
    );

    // Mobile-optimized table columns
    const getTableColumns = () => [
        {
            title: 'Name',
            dataIndex: 'Name',
            key: 'name',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#DAA520]/10 rounded-full flex items-center justify-center">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#DAA520]" />
                    </div>
                    <span className="font-medium text-[#132430] text-xs sm:text-sm">{text}</span>
                </div>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'Phone_Number',
            key: 'contact',
            render: (text: string, record: FlattenedPartner) => (
                <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-[#DAA520]" />
                        <span className="text-gray-700">{text || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-[#DAA520]" />
                        <span className="text-gray-700">{record.Email || '—'}</span>
                    </div>
                </div>
            ),
            responsive: ['xs'] as any,
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'email',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#DAA520]" />
                    <span className="text-gray-700 text-xs sm:text-sm">{text || '—'}</span>
                </div>
            ),
            responsive: ['sm'] as any,
        },
        {
            title: 'Phone',
            dataIndex: 'Phone_Number',
            key: 'phone',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#DAA520]" />
                    <span className="text-gray-700 text-xs sm:text-sm">{text || '—'}</span>
                </div>
            ),
            responsive: ['sm'] as any,
        },
        {
            title: 'Organization',
            dataIndex: 'Organization_Name',
            key: 'organization',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-[#DAA520]" />
                    <span className="text-gray-700 text-xs sm:text-sm">{text || '—'}</span>
                </div>
            ),
            responsive: ['md'] as any,
        },
        {
            title: 'Reports To',
            dataIndex: ['Reporting_To_Partner', 'name'],
            key: 'reportingTo',
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-[#DAA520]" />
                    <span className="text-gray-700 text-xs sm:text-sm">{text || user?.Reporting_To_Partner?.name || user?.name}</span>
                </div>
            ),
            responsive: ['lg'] as any,
        },
    ];

    const items = [
        {
            key: 'list',
            label: 'List View',
            children: (
                <>
                    {isMobile ? (
                        <div className="mb-4 flex gap-2">
                            <Button
                                icon={<Filter className="w-4 h-4" />}
                                onClick={() => setFilterDrawerOpen(true)}
                                className="flex items-center border-[#DAA520] text-[#DAA520]"
                            >
                                Filters
                                {(searchFilters.name || searchFilters.phone || searchFilters.email || searchFilters.parent) && (
                                    <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-[#DAA520] text-white text-xs">
                                        {Object.values(searchFilters).filter(Boolean).length}
                                    </span>
                                )}
                            </Button>
                            <Input.Search
                                placeholder="Quick search..."
                                allowClear
                                className="flex-1"
                                size="middle"
                                onSearch={(value) => setSearchFilters(prev => ({ ...prev, name: value }))}
                            />
                        </div>
                    ) : (
                        <SearchAndFilters />
                    )}

                    <Drawer
                        title="Search & Filters"
                        placement="bottom"
                        height="80%"
                        onClose={() => setFilterDrawerOpen(false)}
                        open={filterDrawerOpen}
                        className="partners-filter-drawer"
                        closeIcon={<X className="text-[#132430]" />}
                        extra={
                            <Button
                                type="default"
                                onClick={clearFilters}
                                className="border-[#DAA520] text-[#DAA520]"
                                size="small"
                            >
                                Clear
                            </Button>
                        }
                    >
                        <div className="space-y-4 pb-16">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#132430]">Search by Name</label>
                                <Input.Search
                                    placeholder="Enter partner name..."
                                    allowClear
                                    className="w-full"
                                    value={searchFilters.name}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                                    prefix={<Users className="w-4 h-4 text-gray-400" />}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#132430]">Search by Phone</label>
                                <Input.Search
                                    placeholder="Enter phone number..."
                                    allowClear
                                    className="w-full"
                                    value={searchFilters.phone}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, phone: e.target.value }))}
                                    prefix={<Phone className="w-4 h-4 text-gray-400" />}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#132430]">Search by Email</label>
                                <Input.Search
                                    placeholder="Enter email address..."
                                    allowClear
                                    className="w-full"
                                    value={searchFilters.email}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, email: e.target.value }))}
                                    prefix={<Mail className="w-4 h-4 text-gray-400" />}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#132430]">Select Parent Partner</label>
                                <TreeSelect
                                    placeholder="Choose parent partner..."
                                    allowClear
                                    className="w-full"
                                    treeData={hierarchy ? [convertToTreeData(hierarchy)] : []}
                                    onChange={(value) => {
                                        setSelectedParent(value);
                                        setSearchFilters(prev => ({ ...prev, parent: value }));
                                    }}
                                    treeIcon
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    value={selectedParent}
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                                <Button
                                    type="primary"
                                    block
                                    onClick={() => setFilterDrawerOpen(false)}
                                    className="bg-[#DAA520] hover:bg-[#C89932] border-none"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </Drawer>

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Spin />
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            {isMobile ? (
                                <div className="space-y-2">
                                    {filteredPartners.length > 0 ? (
                                        <>
                                            <div className="flex justify-between items-center mb-3 px-1">
                                                <Typography.Text className="text-gray-500 text-xs">
                                                    Showing {filteredPartners.length} partners
                                                </Typography.Text>
                                            </div>

                                            <div className="px-1"> {/* Added padding to prevent cards from touching screen edges */}
                                                <List
                                                    dataSource={filteredPartners}
                                                    renderItem={(partner) => (
                                                        <PartnerCard
                                                            key={partner.id}
                                                            partner={partner}
                                                            parentName={user?.name}
                                                        />
                                                    )}
                                                    pagination={{
                                                        pageSize: 8,
                                                        size: 'small',
                                                        className: 'mt-4 mb-16', // Add bottom margin to avoid bottom nav overlap
                                                        hideOnSinglePage: true,
                                                    }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-10 px-4 bg-[#f6f4ef] rounded-lg mx-1">
                                            <div className="bg-white w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                                                <Users className="w-8 h-8 text-[#DAA520]/60" />
                                            </div>
                                            <Typography.Text strong className="text-[#132430] block text-base">
                                                No partners found
                                            </Typography.Text>
                                            <Typography.Text className="text-gray-500 block text-sm mt-1">
                                                Try adjusting your search filters
                                            </Typography.Text>
                                            <Button
                                                type="primary"
                                                onClick={clearFilters}
                                                className="mt-4 bg-[#DAA520] hover:bg-[#C89932] border-none shadow-sm"
                                            >
                                                Clear all filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Desktop Table View - Keep existing table
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <Table<FlattenedPartner>
                                        columns={getTableColumns()}
                                        dataSource={filteredPartners}
                                        rowKey="id"
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showTotal: total => `Total ${total} partners`,
                                            className: 'px-4 py-3',
                                        }}
                                        className="partners-table"
                                        size="middle"
                                        scroll={{ x: 'max-content' }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            ),
        },
        {
            key: 'hierarchy',
            label: 'Hierarchy View',
            children: loading ? (
                <div className="flex justify-center items-center h-40">
                    <Spin />
                </div>
            ) : (
                hierarchy ? <PartnerHierarchyTree data={hierarchy} /> : null
            ),
        },
    ];

    const designations = [
        { label: 'GM', value: 'GM' },
        { label: 'AGM', value: 'AGM' },
        { label: 'DGM', value: 'DGM' },
        { label: 'BDM', value: 'BDM' },
    ];

    const handleAddPartner = async (values: any) => {
        try {
            if (!user?.id) {
                message.error('User not authenticated');
                return;
            }

            setIsAddingPartner(true);
            setIsLoadingPartners(true);

            const response: any = await api.post<ApiResponse>('/api/partners', {
                ...values,
                Mobile: `+91${values.Mobile}`,
                Partner_Status: 'Onboarded',
                Reporting_To_Partner: user.id,
            });

            console.log(response);

            // Check if the partner was successfully added
            if (response?.message === 'record added') {
                // Create a new partner object for optimistic UI update
                const newPartner: FlattenedPartner = {
                    id: response.id,
                    Name: response.name || values.Name,
                    Phone_Number: response.phone || `+91${values.Mobile}`,
                    Email: response.email || values.Email || '',
                    Organization_Name: values.Organization_Name || '',
                    Reporting_To_Partner: { name: user.name, id: user.id },
                };

                console.log('Adding new partner with organization:', values.Organization_Name);
                console.log('New partner object:', newPartner);

                // Add to manual partners list for immediate display
                setManuallyAddedPartners(prev => [...prev, newPartner]);

                // Show success message
                message.success('Partner added successfully');

                // Close the modal and reset the form
                setModalOpen(false);
                form.resetFields();

                // Refresh the hierarchy data in the background (will take time due to Zoho CRM)
                dispatch(fetchPartnerHierarchy(user.id));
            } else {
                message.error(response?.message || 'Failed to create partner');
            }
        } catch (error: any) {
            message.error(error.message || 'An error occurred');
        } finally {
            setIsAddingPartner(false);
            setIsLoadingPartners(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 mb-3 sm:mb-6 "
                style={{
                    marginBottom: 8,
                    backgroundColor: 'rgb(19, 36, 48)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                }}>
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold">Partners</h1>
                    <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                        Manage your channel partners
                    </Typography.Text>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                    onClick={() => setModalOpen(true)}
                    className="bg-[#DAA520] hover:bg-[#C89932] border-none shadow-sm rounded-md px-3 sm:px-5 h-8 sm:h-10 flex items-center text-xs sm:text-sm"
                >
                    {isMobile ? 'Add' : 'Add Partner'}
                </Button>
            </div>

            <Card
                className="overflow-hidden border-gray-100 shadow-sm rounded-lg p-0 sm:p-2"
                bodyStyle={{ padding: isMobile ? 0 : 16 }}
            >
                <Tabs
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    items={items}
                    type="card"
                    className="w-full overflow-x-auto min-w-[300px] partner-tabs"
                    size={isMobile ? "small" : "middle"}
                    tabBarStyle={{ marginBottom: isMobile ? 8 : 16 }}
                    centered={isMobile}
                />
            </Card>

            <Modal
                title={
                    <div className="flex items-center text-[#132430] font-semibold">
                        <User className="mr-2 text-[#DAA520]" size={18} />
                        Add New Partner
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                className="partner-modal"
                width={isMobile ? '95%' : 520}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleAddPartner}>
                    <Form.Item name="Name" label="Name" rules={[{ required: true, min: 3 }]}>
                        <Input
                            className="border-gray-200 focus:border-[#DAA520]"
                            placeholder="Enter partner name"
                            prefix={<User className="w-4 h-4 text-[#DAA520]/70" />}
                        />
                    </Form.Item>
                    <Form.Item
                        name="Mobile"
                        label="Mobile"
                        rules={[{ required: true, pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }]}
                    >
                        <Input
                            addonBefore="+91"
                            maxLength={10}
                            className="border-gray-200 focus:border-[#DAA520]"
                            placeholder="Enter mobile number"
                            prefix={<Phone className="w-4 h-4 text-[#DAA520]/70" />}
                        />
                    </Form.Item>
                    <Form.Item name="Parent_Partner" label="Parent Partner" hidden>
                        <Input
                            disabled
                            style={{ color: '#132430', background: '#f6f4ef' }}
                            defaultValue={user?.name}
                            prefix={<Users className="w-4 h-4 text-[#DAA520]/70" />}
                        />
                    </Form.Item>

                    <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input
                            className="border-gray-200 focus:border-[#DAA520]"
                            placeholder="Enter email address"
                            prefix={<Mail className="w-4 h-4 text-[#DAA520]/70" />}
                        />
                    </Form.Item>

                    <Form.Item name="Designation" label="Designation" rules={[{ required: true }]}>
                        <Select
                            className="border-gray-200 focus:border-[#DAA520]"
                            placeholder="Select designation"
                            options={designations}
                        />
                    </Form.Item>

                    <Form.Item name='Organization_Name' label='Organization Name' rules={[{ required: false, min: 3, max: 50 }]}>
                        <Input
                            className="border-gray-200 focus:border-[#DAA520]"
                            placeholder="Enter organization name"
                            prefix={<Building className="w-4 h-4 text-[#DAA520]/70" />}
                        />
                    </Form.Item>


                    <div className="bg-[#f6f4ef] p-4 rounded-md mb-5 text-xs sm:text-sm text-[#132430]">
                        <p>New partners will be directly assigned under your account. You'll be able to manage their leads and performance.</p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button onClick={() => setModalOpen(false)} className="border-gray-200 hover:border-gray-300">Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-[#DAA520] hover:bg-[#C89932] border-none shadow-sm"
                            loading={isAddingPartner}
                        >
                            Create Partner
                        </Button>
                    </div>

                </Form>
            </Modal>
        </div >
    );
};

export default Partners;