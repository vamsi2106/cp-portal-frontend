import React, { useEffect, useState, useRef } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, message, Spin, Tabs, Select, DatePicker, Tooltip, Empty, Typography, Divider, Badge, Avatar, Progress, Radio, Checkbox, Timeline, List, Drawer } from 'antd';
import { Plus, Filter, Users, User, X, Calendar, Clock, RefreshCw, AlertCircle, Search, Phone, BarChart2, GitBranch, PieChart, Download as DownloadIcon, Check, ChevronDown, Maximize2, ChevronRight, FileText, PlusCircle, Mail, Building } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchContactHierarchy } from '../../redux/slices/contactSlice';
import { api } from '../../api/api';
import ContactHierarchyTree from './ContactHierarchyTree';
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';
import type { Contact, ContactHierarchy } from '../../types/contact';
import type { ColumnType, SortOrder } from 'antd/es/table/interface';
import { API_ROUTES } from '../../config/apiRoutes';

const { RangePicker } = DatePicker;

interface PartnerNode {
    partnerId: string;
    partnerName: string;
    Email?: string | null;
    Phone_Number?: string | null;
    Address?: string | null;
    contacts: Contact[];
    subPartners: PartnerNode[];
}

// Status colors with Ridhira theme
const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'new':
            return 'rgb(204, 169, 90)';
        case 'contacted':
            return 'rgb(236, 190, 117)';
        case 'qualified':
            return 'rgb(100, 141, 174)';
        case 'converted':
            return 'rgb(87, 148, 133)';
        case 'lost':
            return 'rgb(179, 98, 96)';
        case 'new lead':
            return 'rgb(204, 169, 90)';
        default:
            return 'rgb(204, 169, 90)';
    }
};

// Status tag class based on status
const getStatusTagClass = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'new':
            return 'status-tag-new';
        case 'contacted':
            return 'status-tag-contacted';
        case 'qualified':
            return 'status-tag-qualified';
        case 'converted':
            return 'status-tag-converted';
        case 'lost':
            return 'status-tag-lost';
        case 'new lead':
            return 'status-tag-new';
        default:
            return 'status-tag-new';
    }
};

// Add a ContactCard component for mobile view
const ContactCard: React.FC<{ contact: any; onViewDetails: (contact: any) => void }> = ({ contact, onViewDetails }) => {
    return (
        <Card
            className="mb-3 border border-gray-100 rounded-xl overflow-hidden hover:border-[#DAA520]/30 transition-all"
            bodyStyle={{ padding: 0 }}
            styles={{ body: { padding: 0 } }}
        >
            <div className="flex flex-col">
                {/* Card Header */}
                <div className="bg-[#f6f4ef] py-2.5 px-3 border-b border-gray-100 flex items-center">
                    <Avatar
                        style={{
                            backgroundColor: 'rgb(19, 36, 48)',
                            color: 'rgb(204, 169, 90)',
                            marginRight: 8,
                        }}
                        icon={<User size={16} />}
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[#132430] font-semibold text-sm truncate m-0">{contact.ContactName}</h3>
                        {contact.Email && (
                            <div className="text-xs text-[#132430]/70 truncate">
                                {contact.Email}
                            </div>
                        )}
                    </div>
                    <Tag className={getStatusTagClass(contact.Contact_Status || contact.Lead_Status || 'New')}>
                        {contact.Contact_Status || contact.Lead_Status || 'New'}
                    </Tag>
                </div>

                {/* Card Content */}
                <div className="px-3 py-2.5">
                    <div className="grid grid-cols-1 gap-2">
                        {contact.Phone_Number && (
                            <a
                                href={`tel:${contact.Phone_Number}`}
                                className="flex items-center text-gray-700 hover:text-[#DAA520] active:bg-gray-50 rounded-md p-1 -ml-1"
                                style={{ touchAction: 'manipulation' }}
                            >
                                <div className="w-7 h-7 bg-[#f6f4ef] rounded-full flex items-center justify-center mr-2">
                                    <Phone className="w-3.5 h-3.5 text-[#DAA520]" />
                                </div>
                                <span className="text-sm truncate">{contact.Phone_Number}</span>
                            </a>
                        )}

                        {contact.Product && (
                            <div className="flex items-center text-gray-700 rounded-md p-1 -ml-1">
                                <div className="w-7 h-7 bg-[#f6f4ef] rounded-full flex items-center justify-center mr-2">
                                    <Building className="w-3.5 h-3.5 text-[#DAA520]" />
                                </div>
                                <span className="text-sm truncate">{contact.Product}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Footer */}
                {contact.partnerPath && (
                    <div className="bg-[#f6f4ef]/50 px-3 py-2 border-t border-gray-100 flex items-center text-xs text-gray-600">
                        <PieChart className="w-3.5 h-3.5 mr-1.5 text-[#DAA520]/70" />
                        <span className="truncate">
                            {contact.partnerPath}
                        </span>
                    </div>
                )}

                {/* Action Button */}
                <div className="bg-white px-3 py-2.5 border-t border-gray-100">
                    <Button
                        block
                        onClick={() => onViewDetails(contact)}
                        className="border-[#DAA520] text-[#DAA520] hover:text-[#C89932] hover:border-[#C89932]"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </Card>
    );
};

// Add a simplified mobile hierarchy view component
const MobileHierarchyView = ({ data }: { data: PartnerNode[] }) => {
    const [expandedPartners, setExpandedPartners] = useState<string[]>([]);

    const togglePartner = (partnerId: string) => {
        if (expandedPartners.includes(partnerId)) {
            setExpandedPartners(expandedPartners.filter(id => id !== partnerId));
        } else {
            setExpandedPartners([...expandedPartners, partnerId]);
        }
    };

    const renderPartner = (partner: PartnerNode, level: number = 0, path: string = '') => {
        const isExpanded = expandedPartners.includes(partner.partnerId);
        const hasSubpartners = partner.subPartners && partner.subPartners.length > 0;
        const hasContacts = partner.contacts && partner.contacts.length > 0;
        const currentPath = path ? `${path} > ${partner.partnerName}` : partner.partnerName;

        return (
            <div key={partner.partnerId} style={{ marginBottom: '8px' }}>
                <div
                    className={`px-3 py-2.5 rounded-lg ${level === 0 ? 'bg-[#132430] text-white' : 'bg-[#f6f4ef] text-[#132430] border border-gray-200'}`}
                    style={{ marginLeft: `${level * 16}px` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center ${level === 0
                                    ? 'bg-[rgba(204,169,90,0.3)] text-[#DAA520]'
                                    : 'bg-[rgba(204,169,90,0.15)] text-[#DAA520]'}`}
                            >
                                <User size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm truncate ${level === 0 ? 'text-white' : 'text-[#132430]'}`}>
                                    {partner.partnerName}
                                </h3>
                                <div className={`text-xs ${level === 0 ? 'text-white/70' : 'text-[#132430]/70'}`}>
                                    {hasContacts ? `${partner.contacts.length} contacts` : 'No contacts'}
                                </div>
                            </div>
                        </div>
                        {(hasSubpartners || hasContacts) && (
                            <Button
                                type="text"
                                size="small"
                                shape="circle"
                                onClick={() => togglePartner(partner.partnerId)}
                                icon={isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                className={level === 0 ? 'text-white' : 'text-[#132430]'}
                            />
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <div className="ml-4 mt-2 mb-2">
                        {/* Show contacts */}
                        {hasContacts && partner.contacts.map(contact => (
                            <div
                                key={contact.id}
                                className="ml-4 mb-2 p-2 bg-white border border-gray-100 rounded-lg shadow-sm"
                            >
                                <div className="flex items-center">
                                    <Avatar
                                        size="small"
                                        icon={<User size={12} />}
                                        style={{
                                            backgroundColor: 'rgba(204,169,90,0.1)',
                                            color: '#DAA520',
                                            marginRight: '8px'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[#132430] truncate">
                                            {contact.ContactName}
                                        </div>
                                        {contact.Phone_Number && (
                                            <a
                                                href={`tel:${contact.Phone_Number}`}
                                                className="text-xs text-[#132430]/70 flex items-center"
                                            >
                                                <Phone size={10} className="mr-1 text-[#DAA520]" />
                                                {contact.Phone_Number}
                                            </a>
                                        )}
                                    </div>
                                    <Tag
                                        className={getStatusTagClass(contact.Contact_Status || contact.Lead_Status || 'New')}
                                        style={{ fontSize: '10px', lineHeight: 1.2 }}
                                    >
                                        {contact.Contact_Status || contact.Lead_Status || 'New'}
                                    </Tag>
                                </div>
                            </div>
                        ))}

                        {/* Show subpartners */}
                        {hasSubpartners && partner.subPartners.map(subPartner =>
                            renderPartner(subPartner, level + 1, currentPath)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-2">
            {data.length > 0 ? (
                data.map(partner => renderPartner(partner))
            ) : (
                <Empty description="No contact hierarchy data found" />
            )}
        </div>
    );
};

const Contacts: React.FC = () => {
    // Redux state and dispatch
    const dispatch = useDispatch<AppDispatch>();
    const contactHierarchy = useSelector((state: RootState) => state.contact.hierarchy);
    const loading = useSelector((state: RootState) => state.contact.loading);
    const user = useSelector((state: RootState) => state.auth.user);
    const partnerId = user?.id;

    // Component state
    const [activeTab, setActiveTab] = useState<string>('table');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isContactDetailVisible, setIsContactDetailVisible] = useState<boolean>(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [form] = Form.useForm();
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [partnerFilter, setPartnerFilter] = useState<string[]>([]);
    const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    // Add a ref to track if component is mounted
    const isMounted = useRef<boolean>(true);
    // Add a ref to track modal state changes
    const modalStateRef = useRef<{ isContactDetailVisible: boolean, isModalVisible: boolean }>({
        isContactDetailVisible: false,
        isModalVisible: false
    });

    // Add isMobile state
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

    // Cleanup function for useEffect
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Fetch initial data
    useEffect(() => {
        if (partnerId) {
            console.log("Fetching contact hierarchy for partner ID:", partnerId);
            dispatch(fetchContactHierarchy(partnerId));
            fetchStatusCounts(partnerId);
        } else {
            console.log("No partner ID available:", user);
        }
    }, [dispatch, partnerId, user]);

    // Fetch status counts for dashboard
    const fetchStatusCounts = async (id: string) => {
        try {
            const response: any = await api.get(API_ROUTES.CONTACTS.FUNNEL(id));
            if (response?.data?.statusCounts && isMounted.current) {
                setStatusCounts(response.data.statusCounts);
            }
        } catch (error) {
            console.error('Error fetching contact funnel data:', error);
        }
    };

    // Update the function that opens the contact detail modal
    const openContactDetail = (record: any) => {
        // Prevent multiple rapid clicks
        if (modalStateRef.current.isContactDetailVisible) return;

        // Set modal state in ref to prevent race conditions
        modalStateRef.current.isContactDetailVisible = true;

        // Set the selected contact and show the modal immediately
        setSelectedContact(record);
        setIsContactDetailVisible(true);
    };

    // Function to close contact detail modal
    const closeContactDetail = () => {
        modalStateRef.current.isContactDetailVisible = false;
        setIsContactDetailVisible(false);
    };

    // Function to open new contact modal
    const openNewContactModal = () => {
        modalStateRef.current.isModalVisible = true;
        setIsModalVisible(true);
    };

    // Function to close new contact modal
    const closeNewContactModal = () => {
        modalStateRef.current.isModalVisible = false;
        setIsModalVisible(false);
        form.resetFields();
    };

    // Flatten hierarchy data for table view
    const flattenContacts = (partners?: PartnerNode[] | null): any[] => {
        if (!partners) return [];

        let flattened: any[] = [];

        const flatten = (partner: PartnerNode, path = '', level = 0) => {
            const partnerPath = path ? `${path} > ${partner.partnerName}` : partner.partnerName;

            partner.contacts.forEach(contact => {
                flattened.push({
                    ...contact,
                    partnerName: partner.partnerName,
                    partnerId: partner.partnerId,
                    partnerPath: partnerPath,
                    partnerLevel: level,
                    isDirectOwner: contact.Owner?.id === partner.partnerId
                });
            });

            if (partner.subPartners) {
                partner.subPartners.forEach(subPartner => {
                    flatten(subPartner, partnerPath, level + 1);
                });
            }
        };

        partners.forEach(partner => flatten(partner));
        return flattened;
    };

    // Get unique values for filters
    const getUniqueStatuses = () => {
        const flatData = flattenContacts(contactHierarchy);
        const statuses = new Set<string>();
        flatData.forEach((item: any) => {
            if (item.Contact_Status) statuses.add(item.Contact_Status);
            if (item.Lead_Status) statuses.add(item.Lead_Status);
        });
        return Array.from(statuses).map(status => ({ text: status, value: status }));
    };

    const getUniquePartners = () => {
        const flatData = flattenContacts(contactHierarchy);
        const partners = new Set<string>();
        flatData.forEach((item: any) => {
            if (item.partnerName) partners.add(item.partnerName);
        });
        return Array.from(partners).map(partner => ({ text: partner, value: partner }));
    };

    const getUniqueOwners = () => {
        const flatData = flattenContacts(contactHierarchy);
        const owners = new Set<string>();
        flatData.forEach((item: any) => {
            if (item.Owner?.name) owners.add(item.Owner.name);
        });
        return Array.from(owners).map(owner => ({ text: owner, value: owner }));
    };

    // Function to render partner hierarchy in a breadcrumb style
    const renderPartnerHierarchy = (path: string, record: any) => {
        if (!path) return record.partnerName || '-';

        // Display the partner hierarchy with breadcrumb-like visualization
        const partners = path.split(' > ');
        return (
            <div style={{ maxWidth: '300px' }}>
                {partners.map((partner: string, index: number) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <span style={{ color: '#aaa', margin: '0 4px' }}>
                                <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                            </span>
                        )}
                        <Tooltip title={`Level ${index + 1}`}>
                            <span style={{
                                fontWeight: index === partners.length - 1 ? 500 : 400,
                                color: index === partners.length - 1 ? 'rgb(19, 36, 48)' : '#666'
                            }}>
                                {partner}
                            </span>
                        </Tooltip>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Table columns configuration
    const columns: ColumnType<any>[] = [
        {
            title: 'Contact Name',
            dataIndex: 'ContactName',
            key: 'name',
            sorter: (a, b) => (a.ContactName || '').localeCompare(b.ContactName || ''),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        style={{
                            backgroundColor: 'rgb(19, 36, 48)',
                            color: 'rgb(204, 169, 90)',
                            marginRight: 8,
                        }}
                        icon={<User size={16} />}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        {record.Email && <div style={{ fontSize: '12px', color: '#666' }}>{record.Email}</div>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'Phone_Number',
            key: 'phone',
            render: (text) => text || '-',
        },
        {
            title: 'Status',
            dataIndex: 'Contact_Status',
            key: 'status',
            filters: getUniqueStatuses(),
            onFilter: (value, record) =>
                (record.Contact_Status === value) || (record.Lead_Status === value),
            render: (text, record) => (
                <Tag className={getStatusTagClass(text || record.Lead_Status || 'New')}>
                    {text || record.Lead_Status || 'New'}
                </Tag>
            ),
        },
        {
            title: 'Product',
            dataIndex: 'Product',
            key: 'product',
            render: (text) => text || '-',
        },
        {
            title: 'Partner Hierarchy',
            dataIndex: 'partnerPath',
            key: 'partnerPath',
            filters: getUniquePartners(),
            onFilter: (value, record) => record.partnerName === value,
            render: renderPartnerHierarchy,
        },
        {
            title: 'Owner',
            dataIndex: ['Owner', 'name'],
            key: 'owner',
            filters: getUniqueOwners(),
            onFilter: (value, record) => record.Owner?.name === value,
            render: (text) => text || '-',
        },
        {
            title: 'Created Date',
            dataIndex: 'Created_Time',
            key: 'created',
            sorter: (a, b) => {
                if (!a.Created_Time) return -1;
                if (!b.Created_Time) return 1;
                return new Date(a.Created_Time).getTime() - new Date(b.Created_Time).getTime();
            },
            render: (text) => (text ? dayjs(text).format('MMM D, YYYY') : '-'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        size="small"
                        type="text"
                        icon={<Search size={14} />}
                        onClick={() => openContactDetail(record)}
                        title="View Contact Details"
                    />
                    <Button
                        size="small"
                        type="text"
                        icon={<Phone size={14} />}
                        title="Call Contact"
                        onClick={() => {
                            if (record.Phone_Number) {
                                window.open(`tel:${record.Phone_Number}`);
                            } else {
                                message.warning('No phone number available');
                            }
                        }}
                    />
                </div>
            ),
        },
    ];

    // Filter table data
    const getFilteredData = () => {
        const flatData = flattenContacts(contactHierarchy);

        return flatData.filter((item) => {
            // Search text filter
            const matchesSearch = !searchText ||
                (item.ContactName && item.ContactName.toLowerCase().includes(searchText.toLowerCase())) ||
                (item.Email && item.Email.toLowerCase().includes(searchText.toLowerCase())) ||
                (item.Phone_Number && item.Phone_Number.toLowerCase().includes(searchText.toLowerCase()));

            // Status filter
            const matchesStatus = statusFilter.length === 0 ||
                statusFilter.some(status =>
                    (item.Contact_Status && item.Contact_Status.toLowerCase() === status.toLowerCase()) ||
                    (item.Lead_Status && item.Lead_Status.toLowerCase() === status.toLowerCase())
                );

            // Partner filter
            const matchesPartner = partnerFilter.length === 0 ||
                partnerFilter.includes(item.partnerName);

            // Owner filter
            const matchesOwner = ownerFilter.length === 0 ||
                (item.Owner && ownerFilter.includes(item.Owner.name));

            // Date filter
            const matchesDate = !dateFilter || !dateFilter[0] || !dateFilter[1] ||
                (item.Created_Time &&
                    dayjs(item.Created_Time).isAfter(dateFilter[0]) &&
                    dayjs(item.Created_Time).isBefore(dateFilter[1]));

            return matchesSearch && matchesStatus && matchesPartner && matchesOwner && matchesDate;
        });
    };

    // Count partners in hierarchy
    const countPartners = (partners: any[]): number => {
        if (!partners) return 0;
        return partners.reduce((count, partner) => {
            return count + 1 + countPartners(partner.subPartners || []);
        }, 0);
    };

    // Count total partners
    const totalPartners = contactHierarchy ? countPartners(contactHierarchy) : 0;

    // Get contacts table data
    const contactData = getFilteredData();

    // Add a new contact with optional deal
    const handleAddContact = async (values: any) => {
        try {
            // Set button loading state
            setSubmitting(true);

            // Prepare contact data
            const contactData = {
                Channel_Partner: partnerId,
                Name: values.Name,
                Last_Name: values.Last_Name,
                Mobile: values.Mobile,
                Email: values.Email,
                Lead_Status: "New Lead", // Default for new contacts
                Product: values.Product,
                Notes: values.Notes
            };

            // If deal creation is checked, prepare deal data
            let payload: any = { ...contactData };

            if (values.create_deal) {
                payload.createDeal = true;
                payload.Deal_Name = values.Deal_Name;
                payload.Deal_Stage = values.Deal_Stage;
                payload.Deal_Value = values.Deal_Value;
            }

            // Send the request
            const response: any = await api.post(API_ROUTES.CONTACTS.LIST, payload);
            console.log("Contact creation response:", response);

            // Check if the response contains a duplicate record error
            if (response.error && response.error.includes("phone number already exists")) {
                setSubmitting(false);
                message.error({
                    content: 'A contact with this phone number already exists. Please use a different number.',
                    duration: 5,
                    style: {
                        marginTop: '20px',
                    },
                });
                return;
            }

            // Check for success response - either message=record added OR success=true
            if (response.success === true || response.message === 'record added') {
                // Close modal and reset form
                setIsModalVisible(false);
                form.resetFields();
                setSubmitting(false);

                // Show success message with more details
                if (values.create_deal) {
                    message.success({
                        content: 'Contact and deal created successfully!',
                        duration: 5,
                        style: {
                            marginTop: '20px',
                        },
                    });
                } else {
                    message.success({
                        content: 'Contact created successfully!',
                        duration: 5,
                        style: {
                            marginTop: '20px',
                        },
                    });
                }

                // Refresh data
                if (partnerId) {
                    dispatch(fetchContactHierarchy(partnerId));
                }
            }
            // Handle partial success (contact created but deal failed)
            else if (response.data && response.data.contact && response.data.dealError) {
                setIsModalVisible(false);
                form.resetFields();
                setSubmitting(false);
                message.warning({
                    content: 'Contact created but deal creation failed. Please try adding the deal later.',
                    duration: 6,
                    style: {
                        marginTop: '20px',
                    },
                });

                // Refresh data anyway to show the new contact
                if (partnerId) {
                    dispatch(fetchContactHierarchy(partnerId));
                }
            } else {
                setSubmitting(false);
                message.error({
                    content: 'Failed to create contact. Please try again.',
                    duration: 5,
                    style: {
                        marginTop: '20px',
                    },
                });
                console.error('Unexpected response format:', response);
            }
        } catch (error: any) {
            setSubmitting(false);

            // Check if it's a duplicate contact error (status code 409)
            if (error.response && error.response.status === 409) {
                message.error({
                    content: 'A contact with this phone number already exists. Please use a different number.',
                    duration: 5,
                    style: {
                        marginTop: '20px',
                    },
                });
            } else {
                console.error('Error creating contact:', error);
                message.error({
                    content: 'An error occurred while creating the contact. Please try again.',
                    duration: 5,
                    style: {
                        marginTop: '20px',
                    },
                });
            }
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchText('');
        setStatusFilter([]);
        setPartnerFilter([]);
        setOwnerFilter([]);
        setDateFilter(null);
    };

    // Handle table change for sorting, pagination
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        // Update state with new filter values
        if (filters.status) {
            setStatusFilter(filters.status);
        }
        if (filters.partner) {
            setPartnerFilter(filters.partner);
        }
    };

    // Get hierarchy data
    const getHierarchyData = (): PartnerNode[] => {
        if (!contactHierarchy) return [];
        return contactHierarchy as unknown as PartnerNode[];
    };

    // Toggle fullscreen view
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Dashboard statistics
    const statistics = [
        {
            title: 'Total Contacts',
            value: contactData.length,
            icon: <Users size={20} color="rgb(204, 169, 90)" />,
            color: 'rgb(204, 169, 90)',
            desc: 'All contacts'
        },
        {
            title: 'Partners',
            value: totalPartners,
            icon: <GitBranch size={20} color="rgb(100, 141, 174)" />,
            color: 'rgb(100, 141, 174)',
            desc: 'In hierarchy'
        },
        {
            title: 'New Contacts',
            value: statusCounts['New'] || 0,
            icon: <Plus size={20} color="rgb(87, 148, 133)" />,
            color: 'rgb(87, 148, 133)',
            desc: 'Last 30 days'
        }
    ];

    // Add mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Table loading state for the UI
    const tableLoading = loading || !contactHierarchy;

    // Contact Detail Modal
    const ContactDetailModal = () => {
        if (!selectedContact) return null;

        // Function to handle new deal creation
        const handleNewDeal = () => {
            form.setFieldsValue({
                Name: selectedContact.ContactName,
                Last_Name: selectedContact.Last_Name || selectedContact.ContactName,
                Mobile: selectedContact.Phone_Number,
                Email: selectedContact.Email,
                Product: selectedContact.Product,
                create_deal: true
            });
            closeContactDetail();
            openNewContactModal();
        };

        // Render the deal timeline based on contact data
        const renderDealTimeline = () => {
            const deals = selectedContact.deals || [];
            if (deals.length === 0) {
                return null;
            }

            // Function to get stage tag color
            const getStageTagColor = (stage: string) => {
                const stageColors: { [key: string]: string } = {
                    'Not Interested': '#ff4d4f',
                    'RNR': '#722ed1',
                    'Follow Up': '#faad14',
                    'New Lead': '#ffc53d',
                    'Initial Contact': '#1890ff',
                    'VM Done': '#52c41a',
                    'Call Back': '#fa8c16',
                    'Lost': '#f5222d',
                    'Home Visit Done': '#13c2c2',
                    'Site Visit Done': '#52c41a'
                };
                return stageColors[stage] || '#d9d9d9';
            };

            return (
                <div className="mt-4">
                    {deals.map((deal: any, index: number) => (
                        <div key={deal.id || index} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <span className="font-medium text-[#132430]">
                                        {deal.name || 'Unnamed Deal'}
                                    </span>
                                    <Tag
                                        className="ml-2"
                                        style={{
                                            backgroundColor: getStageTagColor(deal.stage),
                                            color: '#fff',
                                            border: 'none'
                                        }}
                                    >
                                        {deal.stage}
                                    </Tag>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Created: {dayjs(deal.createdTime).format('MMM DD, YYYY')}
                                </div>
                            </div>

                            {/* Stage History Table */}
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <Typography.Text strong>Stage History</Typography.Text>
                                </div>
                                <Table
                                    columns={[
                                        {
                                            title: 'Stage',
                                            dataIndex: 'stage',
                                            key: 'stage',
                                            render: (stage: string) => (
                                                <Tag
                                                    style={{
                                                        backgroundColor: getStageTagColor(stage),
                                                        color: '#fff',
                                                        border: 'none',
                                                        minWidth: '100px',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {stage}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Expected Revenue',
                                            dataIndex: 'expectedRevenue',
                                            key: 'expectedRevenue',
                                            render: (value: number) => value ? `₹${value.toLocaleString()}` : '-'
                                        },
                                        {
                                            title: 'Closing Date',
                                            dataIndex: 'closingDate',
                                            key: 'closingDate',
                                            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
                                        },
                                        {
                                            title: 'Stage Duration',
                                            dataIndex: 'stageDuration',
                                            key: 'stageDuration',
                                            render: (days: number) => days ? `${days} days` : '-'
                                        },
                                        {
                                            title: 'Modified Time',
                                            dataIndex: 'modifiedTime',
                                            key: 'modifiedTime',
                                            render: (time: string) => dayjs(time).format('DD/MM/YYYY hh:mm A')
                                        },
                                        {
                                            title: 'Modified By',
                                            dataIndex: 'modifiedBy',
                                            key: 'modifiedBy'
                                        },
                                        {
                                            title: 'Moved To',
                                            dataIndex: 'movedTo',
                                            key: 'movedTo',
                                            render: (stage: string) => stage ? (
                                                <Tag
                                                    style={{
                                                        backgroundColor: getStageTagColor(stage),
                                                        color: '#fff',
                                                        border: 'none',
                                                        minWidth: '100px',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {stage}
                                                </Tag>
                                            ) : '-'
                                        }
                                    ]}
                                    dataSource={deal.stageHistory}
                                    pagination={false}
                                    size="small"
                                    scroll={{ x: true }}
                                    rowKey={(record, index) => `${deal.id}-${index}`}
                                    className="stage-history-table"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );
        };

        // Get contact initial for avatar
        const getInitial = (name: string) => {
            return name?.charAt(0).toUpperCase() || 'U';
        };

        // Format phone number
        const formatPhone = (phone: string) => {
            return phone || 'Not provided';
        };

        return (
            <Modal
                open={isContactDetailVisible}
                onCancel={closeContactDetail}
                footer={null}
                width={isMobile ? '100%' : 600}
                style={{
                    top: isMobile ? 0 : 100,
                    margin: isMobile ? 0 : undefined,
                    padding: isMobile ? 0 : undefined,
                    maxWidth: isMobile ? '100vw' : undefined
                }}
                bodyStyle={{
                    padding: 0,
                    maxHeight: isMobile ? '100vh' : '70vh',
                    overflowY: 'auto',
                    borderRadius: isMobile ? 0 : undefined
                }}
                className="contacts-detail-modal"
                maskClosable={true}
                destroyOnClose={true}
                closable={false}
                wrapClassName={isMobile ? 'mobile-modal-wrap' : ''}
            >
                {isMobile && (
                    <style>
                        {`
                            .mobile-modal-wrap .ant-modal {
                                margin: 0 !important;
                                padding: 0 !important;
                                max-width: 100% !important;
                                top: 0 !important;
                            }
                            .mobile-modal-wrap .ant-modal-content {
                                border-radius: 0 !important;
                                min-height: 100vh !important;
                            }
                            .ant-modal-wrap {
                                overflow: hidden !important;
                            }
                            /* Custom Timeline Styles */
                            .custom-timeline.ant-timeline {
                                margin-top: 8px;
                            }
                            .custom-timeline .ant-timeline-item {
                                padding-bottom: 12px;
                            }
                            .custom-timeline .ant-timeline-item-tail {
                                border-left: 1px solid rgba(218, 165, 32, 0.2);
                            }
                            .custom-timeline .ant-timeline-item:last-child .ant-timeline-item-tail {
                                border-left: 1px solid transparent;
                            }
                            .custom-timeline .ant-timeline-item-content {
                                margin-left: 20px;
                                padding: 4px 8px;
                                background: rgba(218, 165, 32, 0.05);
                                border-radius: 4px;
                                min-height: auto;
                            }
                            /* Stage History Table Styles */
                            .stage-history-table {
                                font-size: 13px;
                            }
                            .stage-history-table .ant-table-thead > tr > th {
                                background-color: #f8f7f3;
                                font-weight: 500;
                                color: #132430;
                                padding: 8px 16px;
                            }
                            .stage-history-table .ant-table-tbody > tr > td {
                                padding: 8px 16px;
                            }
                            .stage-history-table .ant-table-tbody > tr:hover > td {
                                background-color: rgba(218, 165, 32, 0.05);
                            }
                            .stage-history-table .ant-table-cell {
                                white-space: nowrap;
                            }
                            .stage-history-table .ant-tag {
                                margin-right: 0;
                            }
                            @media (max-width: 768px) {
                                .stage-history-table .ant-table {
                                    font-size: 12px;
                                }
                                .stage-history-table .ant-table-thead > tr > th,
                                .stage-history-table .ant-table-tbody > tr > td {
                                    padding: 8px;
                                }
                            }
                        `}
                    </style>
                )}
                <div className="contact-modal-container">
                    {/* Header */}
                    <div className="bg-[#132430] py-4 px-4 relative">
                        <button
                            className="absolute right-3 top-3 text-white/80 hover:text-white"
                            onClick={closeContactDetail}
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center mt-2">
                            <div className="w-14 h-14 rounded-full bg-[#DAA520] flex items-center justify-center text-white text-xl font-semibold mr-3">
                                {getInitial(selectedContact.ContactName)}
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-semibold mb-0">{selectedContact.ContactName}</h3>
                                <div className="text-white/70 text-sm">
                                    {selectedContact.Email || 'No email provided'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-0">
                        <Tabs
                            defaultActiveKey="overview"
                            centered={false}
                            className="contact-detail-tabs"
                            tabBarStyle={{
                                borderBottom: '1px solid #f0f0f0',
                                marginBottom: 0,
                                paddingLeft: 16
                            }}
                        >
                            <TabPane tab="Overview" key="overview">
                                {/* Contact Details */}
                                <div className="px-4">
                                    {/* Two-column layout */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Contact Status */}
                                        <div className="py-3 border-b border-gray-100">
                                            <div className="text-sm text-gray-500">Contact Status</div>
                                            <div className="mt-1">
                                                <Tag
                                                    className={getStatusTagClass(selectedContact.Contact_Status || selectedContact.Lead_Status || 'New')}
                                                >
                                                    {selectedContact.Contact_Status || selectedContact.Lead_Status || 'Call Back'}
                                                </Tag>
                                            </div>
                                        </div>

                                        {/* Owner */}
                                        <div className="py-3 border-b border-gray-100">
                                            <div className="text-sm text-gray-500">Owner</div>
                                            <div className="mt-1 font-medium text-[#132430] truncate">
                                                {selectedContact.Owner?.name || 'Unassigned'}
                                            </div>
                                        </div>

                                        {/* Created On */}
                                        <div className="py-3 border-b border-gray-100">
                                            <div className="text-sm text-gray-500">Created On</div>
                                            <div className="mt-1 font-medium text-[#132430]">
                                                {selectedContact.Created_Time ? dayjs(selectedContact.Created_Time).format('MMM DD, YYYY') : 'Unknown'}
                                            </div>
                                        </div>

                                        {/* Interested In */}
                                        <div className="py-3 border-b border-gray-100">
                                            <div className="text-sm text-gray-500">Interested In</div>
                                            <div className="mt-1 font-medium text-[#132430] truncate">
                                                {selectedContact.Product || 'Not specified'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone Number - Full width */}
                                    <div className="py-3 border-b border-gray-100">
                                        <div className="text-sm text-gray-500">Phone Number</div>
                                        <div className="mt-1 flex justify-between items-center">
                                            <div className="font-medium text-[#132430]">
                                                {formatPhone(selectedContact.Phone_Number)}
                                            </div>
                                            {selectedContact.Phone_Number && (
                                                <a
                                                    href={`tel:${selectedContact.Phone_Number}`}
                                                    className="text-[#DAA520]"
                                                >
                                                    <Phone size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Partner Journey */}
                                    <div className="py-3">
                                        <div className="mb-2 text-base font-medium">Partner Journey</div>
                                        <div className="bg-[#f8f7f3] py-2 px-3 rounded">
                                            {selectedContact.partnerPath ?
                                                renderPartnerHierarchy(selectedContact.partnerPath, selectedContact) :
                                                <div className="text-gray-500">
                                                    {selectedContact.partnerName || 'No partner journey'}
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    {/* Deal History (only if deals exist) */}
                                    {selectedContact.deals && selectedContact.deals.length > 0 && (
                                        <div className="py-3">
                                            <div className="mb-2 text-base font-medium">Deal History</div>
                                            {renderDealTimeline()}
                                        </div>
                                    )}
                                </div>
                            </TabPane>

                            <TabPane tab="Activity" key="activity">
                                <div className="p-6 text-center text-gray-500">
                                    <div className="mb-2">No activity recorded yet</div>
                                </div>
                            </TabPane>

                            <TabPane tab="Notes" key="notes">
                                <div className="p-6 text-center text-gray-500">
                                    <div className="mb-2">No notes added yet</div>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="fixed bottom-0 left-0 right-0 grid grid-cols-2 gap-0">
                        <button
                            className="py-3 text-center border-r border-t border-gray-200 flex justify-center items-center gap-2 bg-white"
                            onClick={() => {
                                if (selectedContact.Phone_Number) {
                                    window.open(`tel:${selectedContact.Phone_Number}`);
                                } else {
                                    message.warning('No phone number available');
                                }
                            }}
                        >
                            <Phone size={18} />
                            <span>Call</span>
                        </button>
                        <button
                            className="py-3 text-center border-t border-gray-200 flex justify-center items-center gap-2 bg-[#DAA520] text-white"
                            onClick={handleNewDeal}
                        >
                            <Plus size={18} />
                            <span>Add Deal</span>
                        </button>
                    </div>

                    {/* Add padding at the bottom to prevent content from being hidden behind buttons */}
                    <div className="h-16"></div>
                </div>
            </Modal>
        );
    };

    // Contacts page UI
    return (
        <>
            <div className="leads-dashboard-tabs">
                {/* Redesigned compact header card */}
                <Card
                    className="leads-header"
                    style={{
                        marginBottom: 8,
                        backgroundColor: 'rgb(19, 36, 48)',
                        color: 'white',
                        padding: '0px',
                        borderRadius: '8px',
                    }}
                    bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-0.5">
                            <Typography.Title level={isMobile ? 5 : 4} style={{ color: 'white', margin: 0 }}>
                                {isMobile ? 'Contacts' : 'Contacts Dashboard'}
                            </Typography.Title>
                            <Typography.Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? '0.75rem' : '0.9rem', margin: 0 }}>
                                Manage and track all your contacts
                            </Typography.Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<Plus size={isMobile ? 14 : 16} />}
                            onClick={openNewContactModal}
                            className="gold-btn"
                            size={isMobile ? "small" : "middle"}
                        >
                            {isMobile ? 'Add' : 'Add Contact'}
                        </Button>
                    </div>
                </Card>

                {/* Redesigned compact stats card for single row on mobile */}
                <Card
                    className="mb-4 border border-gray-100 rounded-lg overflow-hidden"
                    bodyStyle={{ padding: 0 }}
                >
                    <div className="grid grid-cols-3">
                        {/* Total Contacts */}
                        <div className="stat-item py-2 px-2 md:p-4 flex items-center border-r border-gray-100">
                            <div className="stat-icon mr-2 md:mr-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#FBF7EB] flex items-center justify-center">
                                    <Users size={isMobile ? 14 : 20} className="text-[#DAA520]" />
                                </div>
                            </div>
                            <div>
                                <div className="text-base md:text-2xl font-bold text-[#132430]">{contactData.length}</div>
                                <div className={`${isMobile ? 'hidden' : 'flex'} flex-col`}>
                                    <span className="text-sm text-gray-500">Total Contacts</span>
                                    <span className="text-xs text-gray-400">All contacts</span>
                                </div>
                                <div className={`${isMobile ? 'block' : 'hidden'} text-[10px] text-gray-500`}>
                                    Total
                                </div>
                            </div>
                        </div>

                        {/* Partners */}
                        <div className="stat-item py-2 px-2 md:p-4 flex items-center border-r border-gray-100">
                            <div className="stat-icon mr-2 md:mr-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#F2F7FB] flex items-center justify-center">
                                    <GitBranch size={isMobile ? 14 : 20} className="text-[#648DAE]" />
                                </div>
                            </div>
                            <div>
                                <div className="text-base md:text-2xl font-bold text-[#132430]">{totalPartners}</div>
                                <div className={`${isMobile ? 'hidden' : 'flex'} flex-col`}>
                                    <span className="text-sm text-gray-500">Partners</span>
                                    <span className="text-xs text-gray-400">In hierarchy</span>
                                </div>
                                <div className={`${isMobile ? 'block' : 'hidden'} text-[10px] text-gray-500`}>
                                    Partners
                                </div>
                            </div>
                        </div>

                        {/* New Contacts */}
                        <div className="stat-item py-2 px-2 md:p-4 flex items-center">
                            <div className="stat-icon mr-2 md:mr-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#F2F8F6] flex items-center justify-center">
                                    <Plus size={isMobile ? 14 : 20} className="text-[#579485]" />
                                </div>
                            </div>
                            <div>
                                <div className="text-base md:text-2xl font-bold text-[#132430]">{statusCounts['New'] || 0}</div>
                                <div className={`${isMobile ? 'hidden' : 'flex'} flex-col`}>
                                    <span className="text-sm text-gray-500">New Contacts</span>
                                    <span className="text-xs text-gray-400">Last 30 days</span>
                                </div>
                                <div className={`${isMobile ? 'block' : 'hidden'} text-[10px] text-gray-500`}>
                                    New
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        !isMobile ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Input
                                    placeholder="Search contacts..."
                                    prefix={<Search size={16} />}
                                    style={{ width: 200 }}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                {(searchText || statusFilter.length > 0 || partnerFilter.length > 0 || ownerFilter.length > 0 || dateFilter) && (
                                    <Button
                                        icon={<X size={16} />}
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        ) : null
                    }
                    size={isMobile ? "small" : "middle"}
                >
                    <TabPane tab="Table View" key="table">
                        {!isMobile ? (
                            <>
                                <div style={{ display: 'flex', marginBottom: '16px', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }} className="filter-controls">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ minWidth: '200px' }}
                                        placeholder="Filter by status"
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        options={getUniqueStatuses()}
                                    />
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ minWidth: '200px' }}
                                        placeholder="Filter by partner"
                                        value={partnerFilter}
                                        onChange={setPartnerFilter}
                                        options={getUniquePartners()}
                                    />
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ minWidth: '200px' }}
                                        placeholder="Filter by owner"
                                        value={ownerFilter}
                                        onChange={setOwnerFilter}
                                        options={getUniqueOwners()}
                                    />
                                    <RangePicker
                                        onChange={(dates) => setDateFilter(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                                        value={dateFilter as any}
                                        placeholder={['Start date', 'End date']}
                                        style={{ minWidth: '250px' }}
                                    />
                                    <Button
                                        icon={<DownloadIcon size={16} />}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        icon={<RefreshCw size={16} />}
                                        onClick={() => partnerId && dispatch(fetchContactHierarchy(partnerId))}
                                    >
                                        Refresh
                                    </Button>
                                </div>

                                <Table
                                    className="leads-table"
                                    columns={columns}
                                    dataSource={contactData}
                                    rowKey="id"
                                    loading={tableLoading}
                                    onChange={handleTableChange}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Total ${total} contacts`
                                    }}
                                />
                            </>
                        ) : (
                            // Mobile card view implementation
                            <>
                                <div className="mb-4 flex gap-2">
                                    <Button
                                        icon={<Filter className="w-4 h-4" />}
                                        onClick={() => setFilterDrawerOpen(true)}
                                        className="flex items-center border-[#DAA520] text-[#DAA520]"
                                    >
                                        Filters
                                        {(searchText || statusFilter.length > 0 || partnerFilter.length > 0 || ownerFilter.length > 0) && (
                                            <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-[#DAA520] text-white text-xs">
                                                {[searchText, ...statusFilter, ...partnerFilter, ...ownerFilter].filter(Boolean).length}
                                            </span>
                                        )}
                                    </Button>
                                    <Input.Search
                                        placeholder="Quick search..."
                                        allowClear
                                        className="flex-1"
                                        size="middle"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onSearch={(value) => setSearchText(value)}
                                    />
                                </div>

                                <Drawer
                                    title="Search & Filters"
                                    placement="bottom"
                                    height="80%"
                                    onClose={() => setFilterDrawerOpen(false)}
                                    open={filterDrawerOpen}
                                    className="contacts-filter-drawer"
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
                                            <label className="text-sm font-medium text-[#132430]">Filter by Status</label>
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Select status"
                                                value={statusFilter}
                                                onChange={setStatusFilter}
                                                options={getUniqueStatuses()}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#132430]">Filter by Partner</label>
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Select partner"
                                                value={partnerFilter}
                                                onChange={setPartnerFilter}
                                                options={getUniquePartners()}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#132430]">Filter by Owner</label>
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Select owner"
                                                value={ownerFilter}
                                                onChange={setOwnerFilter}
                                                options={getUniqueOwners()}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#132430]">Date Range</label>
                                            <RangePicker
                                                style={{ width: '100%' }}
                                                onChange={(dates) => setDateFilter(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                                                value={dateFilter as any}
                                                placeholder={['Start date', 'End date']}
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

                                {tableLoading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <Spin />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {contactData.length > 0 ? (
                                            <>
                                                <div className="flex justify-between items-center mb-3 px-1">
                                                    <Typography.Text className="text-gray-500 text-xs">
                                                        Showing {contactData.length} contacts
                                                    </Typography.Text>
                                                    <Button
                                                        size="small"
                                                        icon={<RefreshCw size={14} />}
                                                        onClick={() => partnerId && dispatch(fetchContactHierarchy(partnerId))}
                                                        className="text-[#DAA520] border-[#DAA520]"
                                                    >
                                                        Refresh
                                                    </Button>
                                                </div>

                                                <div className="px-1">
                                                    <List
                                                        dataSource={contactData}
                                                        renderItem={(contact) => (
                                                            <ContactCard
                                                                key={contact.id}
                                                                contact={contact}
                                                                onViewDetails={openContactDetail}
                                                            />
                                                        )}
                                                        pagination={{
                                                            pageSize: 8,
                                                            size: 'small',
                                                            className: 'mt-4 mb-16',  // Add bottom margin to avoid bottom nav overlap
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
                                                    No contacts found
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
                                )}
                            </>
                        )}
                    </TabPane>

                    {/* Update hierarchy view tab for mobile */}
                    <TabPane tab="Hierarchy View" key="hierarchy">
                        {tableLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <>
                                {isMobile ? (
                                    <MobileHierarchyView data={getHierarchyData()} />
                                ) : (
                                    <ContactHierarchyTree data={getHierarchyData()} />
                                )}
                            </>
                        )}
                    </TabPane>
                </Tabs>
            </div>

            <Modal
                title={
                    <div style={{
                        fontSize: '18px',
                        color: 'rgb(19, 36, 48)',
                        borderBottom: '2px solid rgb(204, 169, 90)',
                        paddingBottom: '10px'
                    }}>
                        <PlusCircle size={18} style={{ marginRight: 8, color: 'rgb(204, 169, 90)' }} />
                        Add New Contact & Deal
                    </div>
                }
                visible={isModalVisible}
                onCancel={closeNewContactModal}
                footer={null}
                width={isMobile ? '95%' : 700}
                className="leads-modal"
                destroyOnClose={true}
                maskClosable={false}
                bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
            >
                <Tabs defaultActiveKey="contact" className="contact-deal-tabs">
                    <TabPane tab="Contact Information" key="contact">
                        <Form
                            layout="vertical"
                            form={form}
                            onFinish={handleAddContact}
                            initialValues={{
                                Lead_Status: "New Lead"
                            }}
                            className="contact-form"
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Form.Item
                                    name="Name"
                                    label="Name"
                                    rules={[{ required: true, message: 'Please enter name' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input
                                        placeholder="Enter contact name"
                                        prefix={<User size={14} style={{ color: '#ccc' }} />}
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Last_Name"
                                    label="Last Name"
                                    hidden
                                    initialValue=""
                                >
                                    <Input />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Form.Item
                                    name="Mobile"
                                    label="Mobile"
                                    rules={[{ required: true, message: 'Please enter mobile number' }]}
                                    style={{ flex: 1 }}
                                >
                                    <Input
                                        placeholder="Enter mobile number with country code"
                                        prefix={<Phone size={14} style={{ color: '#ccc' }} />}
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="Email"
                                    label="Email"
                                    style={{ flex: 1 }}
                                >
                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        prefix={<Mail size={14} style={{ color: '#ccc' }} />}
                                        size="large"
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="Lead_Status"
                                label="Status"
                                initialValue="New Lead"
                                hidden
                            >
                                <Select disabled>
                                    <Select.Option value="New Lead">New Lead</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="Product"
                                label="Interested In"
                                rules={[{ required: true, message: 'Please select property' }]}
                            >
                                <Select
                                    placeholder="Select property"
                                    size="large"
                                    dropdownStyle={{ maxHeight: 300 }}
                                >
                                    <Select.OptGroup label="Villas - Plot 1">
                                        <Select.Option value="Plot 1 Villa 1 BHK">Villa 1 BHK</Select.Option>
                                        <Select.Option value="Plot 1 Villa 2 BHK">Villa 2 BHK</Select.Option>
                                        <Select.Option value="Plot 1 Villa 3 BHK">Villa 3 BHK</Select.Option>
                                    </Select.OptGroup>
                                    <Select.OptGroup label="Villas - Plot 2">
                                        <Select.Option value="Plot 2 Villa 1 BHK">Villa 1 BHK</Select.Option>
                                        <Select.Option value="Plot 2 Villa 2 BHK">Villa 2 BHK</Select.Option>
                                        <Select.Option value="Plot 2 Villa 3 BHK">Villa 3 BHK</Select.Option>
                                    </Select.OptGroup>
                                    <Select.OptGroup label="Apartments">
                                        <Select.Option value="Apartment 1 BHK">1 BHK</Select.Option>
                                        <Select.Option value="Apartment 2 BHK">2 BHK</Select.Option>
                                        <Select.Option value="Apartment 3 BHK">3 BHK</Select.Option>
                                    </Select.OptGroup>
                                </Select>
                            </Form.Item>

                            <Divider orientation="left" style={{ color: 'rgb(204, 169, 90)', fontWeight: 500 }}>
                                Deal Information (Optional)
                            </Divider>

                            <div style={{
                                padding: '16px',
                                backgroundColor: 'rgba(204, 169, 90, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                border: '1px solid rgba(204, 169, 90, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <PieChart size={18} style={{ color: 'rgb(204, 169, 90)', marginRight: '10px' }} />
                                    <span style={{ fontWeight: 600, fontSize: '15px', color: 'rgb(19, 36, 48)' }}>Create a deal for this contact</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', marginLeft: '28px' }}>
                                    If your contact is ready to move forward, you can create a deal to track the potential sale.
                                </div>
                            </div>

                            <Form.Item
                                name="create_deal"
                                valuePropName="checked"
                            >
                                <Checkbox style={{ fontSize: '15px' }}>Create a new deal</Checkbox>
                            </Form.Item>

                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.create_deal !== currentValues.create_deal}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('create_deal') ? (
                                        <div style={{
                                            padding: '16px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '8px',
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            <Form.Item
                                                name="Deal_Name"
                                                label="Deal Name"
                                                rules={[{ required: getFieldValue('create_deal'), message: 'Please enter deal name' }]}
                                            >
                                                <Input
                                                    placeholder="E.g., Villa Purchase"
                                                    size="large"
                                                    prefix={<FileText size={14} style={{ color: '#ccc' }} />}
                                                />
                                            </Form.Item>

                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <Form.Item
                                                    name="Deal_Stage"
                                                    label="Deal Stage"
                                                    initialValue="Initial Contact"
                                                    style={{ flex: 1 }}
                                                >
                                                    <Select size="large">
                                                        <Select.Option value="Initial Contact">Initial Contact</Select.Option>
                                                        <Select.Option value="Property Shown">Property Shown</Select.Option>
                                                        <Select.Option value="Negotiation">Negotiation</Select.Option>
                                                        <Select.Option value="Booking">Booking</Select.Option>
                                                        <Select.Option value="Agreement">Agreement</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                name="Deal_Value"
                                                label="Deal Value (₹)"
                                                hidden
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="Estimated value"
                                                    addonAfter="₹"
                                                />
                                            </Form.Item>
                                        </div>
                                    ) : null
                                }
                            </Form.Item>

                            <Form.Item style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <Button
                                        size="large"
                                        onClick={() => {
                                            setIsModalVisible(false);
                                            form.resetFields();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="gold-btn"
                                        size="large"
                                        icon={<Check size={16} />}
                                        loading={submitting}
                                    >
                                        {form.getFieldValue('create_deal') ? 'Add Contact & Deal' : 'Add Contact'}
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    {/* <TabPane tab="Bulk Upload" key="bulk">
                        <div style={{ padding: '24px 0' }}>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span>
                                        Bulk upload contacts from CSV
                                        <br />
                                        <small style={{ color: '#888' }}>Coming soon</small>
                                    </span>
                                }
                            >
                                <Button disabled icon={<DownloadIcon size={16} />}>
                                    Download Template
                                </Button>
                            </Empty>
                        </div>
                    </TabPane> */}
                </Tabs>
            </Modal>

            <ContactDetailModal />
        </>
    );
};

export default Contacts;