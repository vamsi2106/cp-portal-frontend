import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Modal, Form, Input, message, Spin, Tabs, Select, DatePicker, Tooltip, Empty, Typography, Divider, Badge, Avatar, Progress, Radio } from 'antd';
import { Plus, Filter, Users, User, X, Calendar, Clock, RefreshCw, AlertCircle, Search, Phone, BarChart2, GitBranch, PieChart, Download as DownloadIcon, Check, ChevronDown, Maximize2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchLeadHierarchy } from '../../redux/slices/leadSlice';
import { api } from '../../api/api';
import LeadHierarchyTree from './LeadHierarchyTree';
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';
import type { LeadHierarchy } from '../../types/lead';
import type { ColumnType, SortOrder } from 'antd/es/table/interface';
import { API_ROUTES } from '../../config/apiRoutes';

const { RangePicker } = DatePicker;

// Custom styles to enhance the UI
const customStyles = `
  :root {
    --primary-gold: rgb(204, 169, 90);
    --primary-gold-light: rgba(204, 169, 90, 0.15);
    --primary-gold-hover: rgb(184, 149, 70);
    --dark-navy: rgb(19, 36, 48);
    --dark-navy-light: rgb(39, 56, 68);
    --light-cream: rgb(246, 244, 239);
    --medium-cream: rgb(237, 233, 223);
  }

  body {
    background-color: var(--light-cream);
  }

  .leads-dashboard-tabs .ant-tabs-nav {
    margin-bottom: 1.5rem;
  }
  
  .leads-dashboard-tabs .ant-tabs-tab {
    padding: 12px 16px;
    transition: all 0.3s;
    color: var(--dark-navy);
  }
  
  .leads-dashboard-tabs .ant-tabs-tab-active {
    background-color: var(--primary-gold);
    border-radius: 6px 6px 0 0;
    color: white;
  }
  
  .leads-dashboard-tabs .ant-tabs-content {
    padding: 0;
  }
  
  .leads-table .ant-table-thead > tr > th {
    background-color: var(--dark-navy);
    color: white;
    font-weight: 500;
  }
  
  .leads-table .ant-table-tbody > tr:hover > td {
    background-color: var(--medium-cream) !important;
  }

  .leads-table .ant-table-tbody > tr > td {
    border-bottom: 1px solid var(--medium-cream);
  }
  
  .leads-table .ant-table-container {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .leads-table .ant-table-pagination {
    margin: 16px 0;
  }
  
  .leads-modal .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
  }

  .leads-modal .ant-modal-header {
    background-color: var(--dark-navy);
    color: white;
    border-bottom: 1px solid var(--dark-navy-light);
  }

  .leads-modal .ant-modal-title {
    color: white;
  }
  
  /* Enhance sorting indicators */
  .leads-table .ant-table-column-sorter {
    color: var(--primary-gold);
  }
  
  .leads-table .ant-table-column-sorter-up.active,
  .leads-table .ant-table-column-sorter-down.active {
    color: var(--primary-gold);
  }
  
  /* Enhance empty state */
  .ant-empty-normal {
    margin: 32px 0;
  }
  
  /* Enhance filter dropdowns */
  .ant-select-dropdown {
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
    border-color: var(--primary-gold);
  }
  
  .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-color: var(--primary-gold);
    box-shadow: 0 0 0 2px var(--primary-gold-light);
  }
  
  /* Button styling */
  .ant-btn-primary {
    background-color: var(--primary-gold);
    border-color: var(--primary-gold);
  }
  
  .ant-btn-primary:hover, .ant-btn-primary:focus {
    background-color: var(--primary-gold-hover);
    border-color: var(--primary-gold-hover);
  }

  .gold-btn {
    background-color: var(--primary-gold);
    border-color: var(--primary-gold);
    color: white;
  }

  .gold-btn:hover {
    background-color: var(--primary-gold-hover);
    border-color: var(--primary-gold-hover);
    color: white;
  }

  .navy-header {
    background-color: var(--dark-navy);
    color: white;
  }
  
  /* Progress bar animation */
  @keyframes progressAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .animated-progress .ant-progress-bg {
    background: linear-gradient(90deg, var(--primary-gold), #d4b661, var(--primary-gold));
    background-size: 200% 200%;
    animation: progressAnimation 2s ease infinite;
  }
  
  /* Status tag styling */
  .status-tag-new {
    background-color: rgba(204, 169, 90, 0.15);
    border: 1px solid rgba(204, 169, 90, 0.5);
    color: rgb(153, 118, 39);
  }
  
  .status-tag-contacted {
    background-color: rgba(236, 190, 117, 0.15);
    border: 1px solid rgba(236, 190, 117, 0.5);
    color: rgb(184, 126, 31);
  }
  
  .status-tag-qualified {
    background-color: rgba(100, 141, 174, 0.15);
    border: 1px solid rgba(100, 141, 174, 0.5);
    color: rgb(43, 90, 128);
  }
  
  .status-tag-converted {
    background-color: rgba(87, 148, 133, 0.15);
    border: 1px solid rgba(87, 148, 133, 0.5);
    color: rgb(43, 100, 87);
  }
  
  .status-tag-lost {
    background-color: rgba(179, 98, 96, 0.15);
    border: 1px solid rgba(179, 98, 96, 0.5);
    color: rgb(141, 58, 58);
  }
  
  /* Card styling */
  .stat-card {
    background-color: white;
    border: 1px solid var(--medium-cream);
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
  
  .stat-card-icon {
    background-color: var(--dark-navy);
    color: var(--primary-gold);
  }
  
  /* Full screen mode */
  .fullscreen-enabled {
    background: var(--light-cream);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    padding: 20px;
    overflow-y: auto;
  }
  
  .fullscreen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--medium-cream);
  }
  
  /* Responsive styles for mobile */
  @media (max-width: 767px) {
    .leads-header {
      padding: 14px !important;
    }
    
    .stats-container {
      grid-template-columns: 1fr !important;
    }
    
    .filter-controls {
      flex-direction: column;
      align-items: stretch !important;
    }
    
    .filter-controls > * {
      margin-bottom: 8px;
      width: 100% !important;
    }
    
    .search-filters {
      grid-template-columns: 1fr !important;
    }
    
    .mobile-stack {
      flex-direction: column !important;
    }
    
    .mobile-stack > * {
      margin-bottom: 8px;
      width: 100% !important;
    }
    
    .mobile-scroll {
      overflow-x: auto;
    }
    
    .partner-hierarchy-tree {
      min-width: 600px;
    }
    
    .mobile-tabs .ant-radio-button-wrapper {
      padding: 0 8px;
      font-size: 12px;
    }
    
    .mobile-hide {
      display: none;
    }
  }
`;

// Interfaces matching the API response
interface Lead {
    id: string;
    LeadName: string;
    Phone_Number?: string;
    Lead_Status?: string;
    Created_Time?: string;
    Owner?: {
        id: string;
        name: string;
        email: string;
    };
}

interface PartnerNode {
    partnerId: string;
    partnerName: string;
    Email?: string | null;
    Phone_Number?: string | null;
    leads: Lead[];
    subPartners: PartnerNode[];
}

// Define a status color mapping with richer variations
const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
        'New Lead': 'gold',
        'Contacted': 'orange',
        'Qualified': 'blue',
        'Converted': 'green',
        'Lost': 'red',
        'In Progress': 'cyan',
        'Pending': 'warning'
    };

    return statusMap[status] || 'default';
};

// Get status tag class name
const getStatusTagClass = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'new lead':
            return 'status-tag status-tag-new';
        case 'contacted':
            return 'status-tag status-tag-contacted';
        case 'qualified':
            return 'status-tag status-tag-qualified';
        case 'converted':
            return 'status-tag status-tag-converted';
        case 'lost':
            return 'status-tag status-tag-lost';
        case 'in progress':
            return 'status-tag status-tag-contacted';
        case 'pending':
            return 'status-tag status-tag-new';
        default:
            return 'status-tag status-tag-new';
    }
};

const Leads: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, hierarchy } = useSelector((state: RootState) => state.lead);
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<string>('list');
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [dataError, setDataError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Enhanced search filters
    const [filters, setFilters] = useState({
        leadName: '',
        phone: '',
        status: '',
        partner: '',
        owner: '',
        dateRange: null as [string, string] | null,
        sortField: 'Created_Time',
        sortOrder: 'desc' as 'asc' | 'desc',
    });

    useEffect(() => {
        if (user?.id) {
            console.log('Fetching lead hierarchy for user:', user.id);
            dispatch(fetchLeadHierarchy(user.id));
        }
    }, [dispatch, user?.id]);

    // Debug logging
    useEffect(() => {
        console.log('Hierarchy data:', hierarchy);
    }, [hierarchy]);

    // Debug the hierarchy data structure
    useEffect(() => {
        if (hierarchy) {
            console.log('Raw hierarchy data:', hierarchy);
            // Try to identify the structure of the data
            if (Array.isArray(hierarchy)) {
                console.log('Hierarchy is an array with', hierarchy.length, 'items');
            } else if (typeof hierarchy === 'object' && hierarchy !== null) {
                console.log('Hierarchy keys:', Object.keys(hierarchy));
                const typedHierarchy = hierarchy as any;
                if (typedHierarchy.data) {
                    console.log('Hierarchy.data type:', typeof typedHierarchy.data);
                    if (Array.isArray(typedHierarchy.data)) {
                        console.log('Hierarchy.data is an array with', typedHierarchy.data.length, 'items');
                    } else if (typeof typedHierarchy.data === 'object' && typedHierarchy.data !== null) {
                        console.log('Hierarchy.data keys:', Object.keys(typedHierarchy.data));
                        if (typedHierarchy.data.data) {
                            console.log('Hierarchy.data.data type:', typeof typedHierarchy.data.data);
                            if (Array.isArray(typedHierarchy.data.data)) {
                                console.log('Hierarchy.data.data is an array with', typedHierarchy.data.data.length, 'items');
                            }
                        }
                    }
                }
            }
        }
    }, [hierarchy]);

    // Flatten leads for table view with better null checking
    const flattenLeads = (partners?: PartnerNode[]): any[] => {
        if (!partners || !Array.isArray(partners) || partners.length === 0) {
            console.log('No partners or invalid partner data:', partners);
            return [];
        }

        console.log('Flattening partners:', partners);
        const flattened: any[] = [];

        const flatten = (partner: PartnerNode, path = '') => {
            if (!partner) return;

            const currentPath = path ? `${path} > ${partner.partnerName}` : partner.partnerName;

            // Add leads for current partner with default values for optional fields
            if (partner.leads && Array.isArray(partner.leads)) {
                partner.leads.forEach(lead => {
                    if (!lead) return;

                    flattened.push({
                        id: lead.id,
                        LeadName: lead.LeadName,
                        Phone_Number: lead.Phone_Number || '',
                        Lead_Status: lead.Lead_Status || 'New Lead',
                        Created_Time: lead.Created_Time || new Date().toISOString(),
                        Owner: lead.Owner || { id: '', name: '', email: '' },
                        partnerPath: currentPath
                    });
                });
            }

            // Process sub-partners
            if (partner.subPartners && Array.isArray(partner.subPartners)) {
                partner.subPartners.forEach(sub => {
                    if (sub) flatten(sub, currentPath);
                });
            }
        };

        partners.forEach(partner => {
            if (partner) flatten(partner);
        });

        console.log('Flattened leads result:', flattened);
        return flattened;
    };

    // Get all leads with proper null checks
    const allLeads = React.useMemo(() => {
        try {
            // First, check if hierarchy exists
            if (!hierarchy) {
                console.log('Hierarchy is null or undefined');
                return [];
            }

            // Check if hierarchy has the expected structure
            if (!hierarchy || (!('data' in hierarchy) && !Array.isArray(hierarchy))) {
                console.log('Invalid hierarchy structure:', hierarchy);
                setDataError('Invalid data structure received from API');
                return [];
            }

            // Handle the case where hierarchy might be an array directly
            if (Array.isArray(hierarchy)) {
                console.log('Hierarchy is an array directly');
                return flattenLeads(hierarchy);
            }

            // TypeScript assertion to handle hierarchy.data
            const hierarchyData = hierarchy as { data: any };

            // Handle the case where hierarchy.data might be an array directly
            if (Array.isArray(hierarchyData.data)) {
                console.log('Hierarchy.data is an array directly');
                return flattenLeads(hierarchyData.data);
            }

            // Handle the case where hierarchy.data.data might be the array
            if (hierarchyData.data && 'data' in hierarchyData.data && Array.isArray(hierarchyData.data.data)) {
                console.log('Hierarchy.data.data is an array');
                return flattenLeads(hierarchyData.data.data);
            }

            console.log('Could not find valid data structure in hierarchy:', hierarchy);
            setDataError('Unable to process data from API');
            return [];
        } catch (error) {
            console.error('Error processing leads data:', error);
            setDataError('Error processing data');
            return [];
        }
    }, [hierarchy]);

    // Get unique values for filter dropdowns with null checking
    const getUniqueStatuses = () => {
        const statuses = allLeads
            .map(lead => lead?.Lead_Status)
            .filter((status, index, array) =>
                status && array.indexOf(status) === index
            );
        return statuses;
    };

    const getUniquePartners = () => {
        const partners = allLeads
            .map(lead => lead?.partnerPath)
            .filter((partner, index, array) =>
                partner && array.indexOf(partner) === index
            );
        return partners;
    };

    const getUniqueOwners = () => {
        const owners = allLeads
            .map(lead => lead?.Owner?.name)
            .filter((owner, index, array) =>
                owner && array.indexOf(owner) === index
            );
        return owners;
    };

    // Apply enhanced filters with sorting and null checking
    const filteredLeads = allLeads
        .filter(lead => {
            if (!lead) return false;

            const nameMatch = !filters.leadName ||
                (lead.LeadName?.toLowerCase() || '').includes(filters.leadName.toLowerCase());

            const phoneMatch = !filters.phone ||
                (lead.Phone_Number || '').includes(filters.phone);

            const statusMatch = !filters.status ||
                lead.Lead_Status === filters.status;

            const partnerMatch = !filters.partner ||
                (lead.partnerPath || '').includes(filters.partner);

            const ownerMatch = !filters.owner ||
                (lead.Owner?.name || '') === filters.owner;

            let dateMatch = true;
            if (filters.dateRange && lead.Created_Time) {
                const [startDate, endDate] = filters.dateRange;
                const leadDate = new Date(lead.Created_Time);
                dateMatch = (
                    (!startDate || new Date(startDate) <= leadDate) &&
                    (!endDate || leadDate <= new Date(endDate))
                );
            }

            return nameMatch && phoneMatch && statusMatch && partnerMatch && ownerMatch && dateMatch;
        })
        .sort((a, b) => {
            const field = filters.sortField;
            let valA, valB;

            if (field === 'partnerPath') {
                valA = a.partnerPath || '';
                valB = b.partnerPath || '';
            } else if (field === 'Owner') {
                valA = a.Owner?.name || '';
                valB = b.Owner?.name || '';
            } else {
                valA = a[field as keyof typeof a] || '';
                valB = b[field as keyof typeof b] || '';
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return filters.sortOrder === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            // Handle dates
            if (field === 'Created_Time') {
                const dateA = valA ? new Date(valA as string).getTime() : 0;
                const dateB = valB ? new Date(valB as string).getTime() : 0;
                return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }

            return 0;
        });

    // Get total partners count recursively with proper null checks
    const countPartners = (partners: any[]): number => {
        if (!partners || !Array.isArray(partners)) return 0;
        let count = partners.length;
        partners.forEach(partner => {
            if (partner?.subPartners?.length) {
                count += countPartners(partner.subPartners);
            }
        });
        return count;
    };

    // Statistics with proper null checks
    const statistics = {
        totalLeads: allLeads.length,
        totalPartners: (() => {
            if (!hierarchy) return 0;
            const hierarchyData = hierarchy as { data: any };
            if (!('data' in hierarchy)) return 0;
            return countPartners(
                Array.isArray(hierarchyData.data)
                    ? hierarchyData.data
                    : ('data' in hierarchyData.data ? hierarchyData.data.data : []) || []
            );
        })(),
        newLeads: allLeads.filter(lead => lead?.Lead_Status === 'New Lead').length,
        filteredLeads: filteredLeads.length
    };

    const columns: ColumnType<any>[] = [
        {
            title: 'Lead Name',
            dataIndex: 'LeadName',
            key: 'name',
            sorter: true,
            sortOrder: filters.sortField === 'LeadName'
                ? (filters.sortOrder === 'asc' ? 'ascend' : 'descend') as SortOrder
                : undefined,
            render: (text: string, record: any) => (
                <div className="flex items-center py-1">
                    <Avatar
                        className="bg-blue-50 text-blue-600 mr-3 flex-shrink-0"
                        size="large"
                    >
                        {text.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div className="font-medium text-gray-800">{text}</div>
                        {record.Phone_Number && (
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                <Phone className="w-3 h-3 mr-1" />
                                {record.Phone_Number}
                            </div>
                        )}
                    </div>
                </div>
            ),
            width: 250,
        },
        {
            title: 'Status',
            dataIndex: 'Lead_Status',
            key: 'status',
            sorter: true,
            sortOrder: filters.sortField === 'Lead_Status'
                ? (filters.sortOrder === 'asc' ? 'ascend' : 'descend') as SortOrder
                : undefined,
            render: (status: string) => (
                <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${getStatusTagClass(status || '')}`}>
                    {status || 'New Lead'}
                </span>
            ),
            width: 120,
            filters: getUniqueStatuses().map(status => ({ text: status, value: status })),
            onFilter: (value, record) => record.Lead_Status === value,
        },
        {
            title: 'Partner Path',
            dataIndex: 'partnerPath',
            key: 'partnerPath',
            sorter: true,
            sortOrder: filters.sortField === 'partnerPath'
                ? (filters.sortOrder === 'asc' ? 'ascend' : 'descend') as SortOrder
                : undefined,
            render: (path: string) => {
                if (!path) return '-';
                const parts = path.split(' > ');
                if (parts.length === 1) return path;

                return (
                    <Tooltip title={path}>
                        <div className="flex items-center text-gray-700">
                            <span className="font-medium">{parts[0]}</span>
                            {parts.length > 1 && (
                                <span className="text-gray-500 ml-1 flex items-center">
                                    <ChevronDown className="h-3 w-3" />
                                    {parts.length - 1} {parts.length === 2 ? 'level' : 'levels'}
                                </span>
                            )}
                        </div>
                    </Tooltip>
                );
            },
            ellipsis: true,
        },
        {
            title: 'Lead Owner',
            dataIndex: ['Owner', 'name'],
            key: 'owner',
            sorter: true,
            sortOrder: filters.sortField === 'Owner'
                ? (filters.sortOrder === 'asc' ? 'ascend' : 'descend') as SortOrder
                : undefined,
            render: (name: string) => (
                <div className="flex items-center">
                    {name ? (
                        <>
                            <Badge status="success" />
                            <span className="ml-2">{name}</span>
                        </>
                    ) : (
                        <>
                            <Badge status="default" />
                            <span className="ml-2 text-gray-500">Unassigned</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'Created_Time',
            key: 'createdDate',
            sorter: true,
            defaultSortOrder: 'descend' as SortOrder,
            sortOrder: filters.sortField === 'Created_Time'
                ? (filters.sortOrder === 'asc' ? 'ascend' : 'descend') as SortOrder
                : undefined,
            render: (date: string) => {
                if (!date) return '-';
                const formattedDate = dayjs(date).format('MMM D, YYYY');
                const formattedTime = dayjs(date).format('h:mm A');
                return (
                    <div>
                        <div className="text-gray-800">{formattedDate}</div>
                        <div className="text-xs text-gray-500">{formattedTime}</div>
                    </div>
                );
            },
            width: 150,
        }
    ];

    // Handle form submission for adding a new lead
    const handleAddLead = async (values: any) => {
        const value = {
            ...values,
            associated_partner: user?.id,
        }
        try {
            // Use api directly since there's no addLead action in leadSlice
            const response: any = await api.post(API_ROUTES.LEADS.LIST, values);

            if (response && response.data && !response.data.error) {
                message.success('Lead added successfully');
                setModalVisible(false);
                form.resetFields();

                // Refresh lead data after adding a new lead
                if (user && user.id) {
                    dispatch(fetchLeadHierarchy(user.id));
                }
            } else {
                message.error(response?.data?.error || 'Failed to add lead');
            }
        } catch (error: any) {
            console.error('Error adding lead:', error);
            message.error(error?.response?.data?.error || 'An error occurred while adding the lead');
        }
    };

    const clearFilters = () => {
        setFilters({
            leadName: '',
            phone: '',
            status: '',
            partner: '',
            owner: '',
            dateRange: null,
            sortField: 'Created_Time',
            sortOrder: 'desc',
        });
    };

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (sorter && sorter.field) {
            setFilters(prev => ({
                ...prev,
                sortField: sorter.field,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
            }));
        }
    };

    // Function to safely extract hierarchy data
    const getHierarchyData = (): PartnerNode[] => {
        if (!hierarchy) return [];

        const typedHierarchy = hierarchy as any;

        // Check if data is directly an array
        if (Array.isArray(typedHierarchy)) {
            return typedHierarchy;
        }

        // Check if hierarchy.data is an array
        if (typedHierarchy.data && Array.isArray(typedHierarchy.data)) {
            return typedHierarchy.data;
        }

        // Check if hierarchy.data.data is an array
        if (typedHierarchy.data &&
            typeof typedHierarchy.data === 'object' &&
            typedHierarchy.data.data &&
            Array.isArray(typedHierarchy.data.data)) {
            return typedHierarchy.data.data;
        }

        return [];
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Prevent body scrolling when in fullscreen
        document.body.style.overflow = !isFullscreen ? 'hidden' : 'auto';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={`space-y-6 ${isFullscreen ? 'fullscreen-enabled' : ''}`}>
            {/* Add the custom styles */}
            <style>{customStyles}</style>

            {isFullscreen && (
                <div className="fullscreen-header">
                    <h1 className="text-2xl font-bold text-gray-800">Leads Dashboard</h1>
                    <Button
                        icon={<X className="w-4 h-4" />}
                        onClick={toggleFullscreen}
                        className="hover:bg-gray-100"
                    >
                        Exit Fullscreen
                    </Button>
                </div>
            )}

            {!isFullscreen && (
                <div className="leads-header navy-header rounded-lg shadow-sm p-5">
                    <div className="flex justify-between items-center flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold">Leads Dashboard</h1>
                            <p className="text-gray-300 mt-1">Manage and monitor your sales pipeline</p>
                        </div>
                        <div className="flex gap-3 mt-2 md:mt-0">
                            <Button
                                icon={<RefreshCw className="w-4 h-4" />}
                                onClick={() => user?.id && dispatch(fetchLeadHierarchy(user.id))}
                                loading={loading}
                                className="border text-white hover:bg-gray-700 border-gray-700"
                            >
                                Refresh
                            </Button>
                            <Button
                                icon={<Maximize2 className="w-4 h-4 mr-1" />}
                                onClick={toggleFullscreen}
                                className="border text-white hover:bg-gray-700 border-gray-700"
                            >
                                Fullscreen
                            </Button>
                            <Button
                                type="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => setModalVisible(true)}
                                className="gold-btn"
                            >
                                Add Lead
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Banner - Only in development */}
            {process.env.NODE_ENV !== 'production' && dataError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">
                                {dataError}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
                <div className="stat-card">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full stat-card-icon">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{statistics.totalLeads}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full stat-card-icon">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                                <p className="text-2xl font-bold text-gray-800">{statistics.totalPartners}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full stat-card-icon">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">New Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{statistics.newLeads}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full stat-card-icon">
                                <Filter className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Filtered Leads</p>
                                <p className="text-2xl font-bold text-gray-800">{statistics.filteredLeads}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="rounded-lg shadow-sm">
                <Radio.Group
                    value={activeTab}
                    onChange={e => setActiveTab(e.target.value)}
                    className="mb-4 custom-radio-tabs mobile-tabs"
                    buttonStyle="solid"
                >
                    <Radio.Button value="list">
                        <span className="flex items-center">
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Leads List
                        </span>
                    </Radio.Button>
                    <Radio.Button value="hierarchy">
                        <span className="flex items-center">
                            <GitBranch className="w-4 h-4 mr-2" />
                            Hierarchy View
                        </span>
                    </Radio.Button>
                    <Radio.Button value="analytics">
                        <span className="flex items-center">
                            <PieChart className="w-4 h-4 mr-2" />
                            Analytics
                        </span>
                    </Radio.Button>
                </Radio.Group>

                {activeTab === 'list' ? (
                    <>
                        {/* Enhanced Filters Section with Restored Filters */}
                        <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-100">
                            <div className="navy-header p-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-primary-gold" />
                                    <h3 className="text-lg font-medium">Search & Filter</h3>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="search-filters grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
                                        <Input
                                            placeholder="Search by lead name..."
                                            value={filters.leadName}
                                            onChange={e => setFilters(prev => ({ ...prev, leadName: e.target.value }))}
                                            allowClear
                                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                                            className="rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <Input
                                            placeholder="Search by phone..."
                                            value={filters.phone}
                                            onChange={e => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                                            allowClear
                                            prefix={<Phone className="w-4 h-4 text-gray-400" />}
                                            className="rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <Select
                                            placeholder="Filter by status..."
                                            value={filters.status || undefined}
                                            onChange={value => setFilters(prev => ({ ...prev, status: value }))}
                                            allowClear
                                            style={{ width: '100%' }}
                                            className="rounded-md"
                                            options={getUniqueStatuses().map(status => ({
                                                label: <span className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full bg-${getStatusColor(status || '')}-500 mr-2`}></span>
                                                    {status}
                                                </span>,
                                                value: status
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
                                        <Select
                                            placeholder="Filter by partner..."
                                            value={filters.partner || undefined}
                                            onChange={value => setFilters(prev => ({ ...prev, partner: value }))}
                                            allowClear
                                            style={{ width: '100%' }}
                                            className="rounded-md"
                                            showSearch
                                            optionFilterProp="label"
                                            options={getUniquePartners().map(partner => ({
                                                label: partner,
                                                value: partner
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                                        <Select
                                            placeholder="Filter by owner..."
                                            value={filters.owner || undefined}
                                            onChange={value => setFilters(prev => ({ ...prev, owner: value }))}
                                            allowClear
                                            style={{ width: '100%' }}
                                            className="rounded-md"
                                            options={getUniqueOwners().map(owner => ({
                                                label: owner,
                                                value: owner
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                        <DatePicker.RangePicker
                                            style={{ width: '100%' }}
                                            className="rounded-md"
                                            onChange={(dates, dateStrings) => {
                                                setFilters(prev => ({
                                                    ...prev,
                                                    dateRange: dates ? [dateStrings[0], dateStrings[1]] : null
                                                }))
                                            }}
                                            allowClear
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        icon={<RefreshCw className="w-4 h-4" />}
                                        onClick={clearFilters}
                                        className="rounded-md border-gray-200 text-gray-700"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table Section with better presentation */}
                        <div className="mobile-scroll">
                            {loading ? (
                                <div className="flex justify-center items-center py-16 bg-white rounded-lg shadow-sm">
                                    <div className="text-center">
                                        <Spin size="large" />
                                        <p className="mt-4 text-gray-500">Loading your leads data...</p>
                                    </div>
                                </div>
                            ) : filteredLeads.length > 0 ? (
                                <Table
                                    columns={columns}
                                    dataSource={filteredLeads}
                                    loading={loading}
                                    rowKey="id"
                                    className="leads-table"
                                    pagination={{
                                        pageSize: 10,
                                        showTotal: (total) => `Total ${total} leads`,
                                        showSizeChanger: true,
                                        pageSizeOptions: ['10', '20', '50'],
                                    }}
                                    onChange={handleTableChange}
                                    rowClassName="hover:bg-gray-50 transition-colors"
                                    scroll={{ x: 'max-content' }}
                                />
                            ) : (
                                <Empty
                                    description={
                                        <div className="space-y-2">
                                            <div className="text-lg text-gray-600">{allLeads.length > 0 ? "No leads match your search criteria" : "No leads available"}</div>
                                            {allLeads.length === 0 && hierarchy && !loading && (
                                                <div className="text-gray-600 flex items-center justify-center">
                                                    <AlertCircle size={16} className="inline mr-1" />
                                                    <span>Data may be structured differently than expected</span>
                                                </div>
                                            )}
                                        </div>
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    className="py-16 bg-white rounded-lg shadow-sm"
                                />
                            )}
                        </div>
                    </>
                ) : activeTab === 'hierarchy' ? (
                    <div className="hierarchy-container">
                        {loading ? (
                            <div className="flex justify-center items-center h-80 bg-white rounded-lg shadow-sm">
                                <div className="text-center">
                                    <Spin size="large" />
                                    <p className="mt-4 text-gray-500">Loading hierarchy data...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                                <div className="mb-4 flex justify-between items-center flex-wrap">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2 md:mb-0">Partner Hierarchy</h3>
                                    <Button
                                        type="primary"
                                        icon={<DownloadIcon className="w-4 h-4" />}
                                        className="gold-btn"
                                    >
                                        Export Hierarchy
                                    </Button>
                                </div>
                                <div className="mobile-scroll">
                                    {hierarchy ? (
                                        <LeadHierarchyTree data={getHierarchyData()} />
                                    ) : (
                                        <Empty
                                            description={
                                                <div className="space-y-2">
                                                    <div className="text-lg text-gray-600">No hierarchy data available</div>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => user?.id && dispatch(fetchLeadHierarchy(user.id))}
                                                        className="gold-btn mt-2"
                                                    >
                                                        Refresh Data
                                                    </Button>
                                                </div>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            className="py-12"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Analytics Tab
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Lead Status Distribution</h3>
                            {allLeads.length > 0 ? (
                                <div className="space-y-3">
                                    {getUniqueStatuses().map(status => {
                                        const count = allLeads.filter(lead => lead?.Lead_Status === status).length;
                                        const percentage = Math.round((count / allLeads.length) * 100);
                                        return (
                                            <div key={status} className="flex items-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded inline-block ${getStatusTagClass(status || '')}`}>
                                                    {status || 'Unknown'}
                                                </span>
                                                <div className="flex-1 ml-3">
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div className="bg-primary-gold h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">{count} ({percentage}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Empty description="No data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Leads by Owner</h3>
                            {allLeads.length > 0 ? (
                                <div className="space-y-3">
                                    {getUniqueOwners().map(owner => {
                                        const count = allLeads.filter(lead => lead?.Owner?.name === owner).length;
                                        const percentage = Math.round((count / allLeads.length) * 100);
                                        return (
                                            <div key={owner} className="flex items-center">
                                                <div className="w-8 h-8 bg-dark-navy rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-primary-gold" />
                                                </div>
                                                <span className="ml-3 flex-1 text-sm font-medium text-gray-800">{owner || 'Unassigned'}</span>
                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                    <div className="bg-primary-gold h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Empty description="No data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                title={
                    <div className="flex items-center text-white">
                        <Plus className="mr-2 h-5 w-5" />
                        <span className="text-xl font-semibold">Add New Lead</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                className="leads-modal"
                width={500}
                centered
            >
                <Divider className="mt-0" />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddLead}
                    className="px-2"
                >
                    <Form.Item
                        name="Lead_Name"
                        label={
                            <span className="text-gray-700 font-medium">Lead Name</span>
                        }
                        rules={[{ required: true, min: 3, message: 'Please enter a lead name (at least 3 characters)' }]}
                    >
                        <Input
                            placeholder="Enter lead's full name"
                            prefix={<User className="h-4 w-4 text-gray-400 mr-1" />}
                            className="rounded-md h-10"
                        />
                    </Form.Item>

                    <Form.Item
                        name="Phone"
                        label={
                            <span className="text-gray-700 font-medium">Phone Number</span>
                        }
                        rules={[{
                            required: true,
                            pattern: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                        }]}
                    >
                        <Input
                            placeholder="Enter 10-digit phone number"
                            prefix={<Phone className="h-4 w-4 text-gray-400 mr-1" />}
                            className="rounded-md h-10"
                        />
                    </Form.Item>

                    <Form.Item
                        name="Email"
                        label={
                            <span className="text-gray-700 font-medium">Email (Optional)</span>
                        }
                        rules={[{
                            type: 'email',
                            message: 'Please enter a valid email address'
                        }]}
                    >
                        <Input
                            placeholder="Enter email address"
                            className="rounded-md h-10"
                        />
                    </Form.Item>

                    <div className="bg-dark-navy-light p-3 rounded-md mb-4 text-white">
                        <div className="flex items-start">
                            <div className="mt-0.5">
                                <Check className="h-4 w-4 text-primary-gold" />
                            </div>
                            <div className="ml-2 text-sm">
                                <span className="font-medium">Note:</span> New leads will be assigned to your account and marked as "New Lead" by default.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <Button
                            onClick={() => setModalVisible(false)}
                            className="rounded-md px-4 h-9 border-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="gold-btn rounded-md px-4 h-9"
                        >
                            Create Lead
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Leads;