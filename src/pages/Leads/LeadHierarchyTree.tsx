import React, { useState, useEffect } from 'react';
import { Tree, Input, Select, Button, Badge, Empty, Divider } from 'antd';
import { Search, Filter, RefreshCw, User, Phone, Mail, ChevronRight, Star } from 'lucide-react';

// Define types locally since the import is causing issues
interface Owner {
    id: string;
    name: string;
    email: string;
}

interface Lead {
    id: string;
    LeadName: string;
    Phone_Number?: string;
    Lead_Status?: string;
    Created_Time?: string;
    Owner?: Owner;
}

interface PartnerNode {
    partnerId: string;
    partnerName: string;
    Email?: string | null;
    Phone_Number?: string | null;
    leads: Lead[];
    subPartners: PartnerNode[];
}

// Clean, Ridhira-themed visual styles
const styles = {
    nodeContainer: {
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.3s',
        marginBottom: '6px',
    },
    nodeContainerHover: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        borderColor: 'rgb(204, 169, 90)',
    },
    primaryPartnerNode: {
        borderLeft: '3px solid rgb(204, 169, 90)',
    },
    subPartnerNode: {
        borderLeft: '3px solid rgba(204, 169, 90, 0.7)',
    },
    leadNode: {
        border: '1px solid #f0f0f0',
        borderRadius: '6px',
        padding: '8px 12px',
        margin: '4px 0',
        backgroundColor: 'rgb(246, 244, 239)',
        display: 'flex',
        alignItems: 'center',
    },
    leadIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgb(237, 233, 223)',
        border: '1px solid #e6e6e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px',
        flexShrink: 0,
    },
    partnerIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgb(19, 36, 48)',
        color: 'rgb(204, 169, 90)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px',
        flexShrink: 0,
    },
    headerTitle: {
        fontWeight: 600,
        fontSize: '15px',
        color: 'rgb(19, 36, 48)',
        marginBottom: '2px',
    },
    statBadge: {
        backgroundColor: 'rgba(204, 169, 90, 0.1)',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '12px',
        color: 'rgb(19, 36, 48)',
        marginLeft: '6px',
        border: '1px solid rgba(204, 169, 90, 0.2)',
    },
    customStyles: `
        /* Theme variables */
        :root {
            --primary-gold: rgb(204, 169, 90);
            --primary-gold-light: rgba(204, 169, 90, 0.15);
            --dark-navy: rgb(19, 36, 48);
            --light-cream: rgb(246, 244, 239);
            --medium-cream: rgb(237, 233, 223);
        }
        
        /* Tree component styling */
        .partner-hierarchy-tree .ant-tree-switcher {
            color: var(--primary-gold);
        }
        
        .partner-hierarchy-tree .ant-tree-node-content-wrapper:hover {
            background-color: var(--light-cream);
        }
        
        .partner-hierarchy-tree .ant-tree-treenode-selected .ant-tree-node-content-wrapper {
            background-color: var(--light-cream) !important;
        }
        
        .partner-hierarchy-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
            background-color: var(--light-cream) !important;
        }
        
        /* Status Tag Styling */
        .status-tag {
            display: inline-flex;
            align-items: center;
            height: 22px;
            padding: 0 8px;
            font-size: 12px;
            border-radius: 4px;
            line-height: 20px;
        }
        
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
        
        /* Filter section styling */
        .hierarchy-filter-container {
            background-color: white;
            border: 1px solid #ede9df;
            border-radius: 6px;
            margin-bottom: 16px;
            overflow: hidden;
        }
        
        .hierarchy-filter-header {
            padding: 12px 16px;
            background-color: var(--dark-navy);
            color: white;
        }
        
        .hierarchy-actions .ant-btn {
            color: var(--dark-navy);
            border-color: var(--primary-gold);
        }
        
        .hierarchy-actions .ant-btn:hover {
            color: var(--primary-gold);
            border-color: var(--primary-gold);
            background-color: rgba(204, 169, 90, 0.05);
        }
        
        .gold-btn {
            background-color: var(--primary-gold);
            border-color: var(--primary-gold);
            color: white;
        }
        
        .gold-btn:hover {
            background-color: rgb(184, 149, 70);
            border-color: rgb(184, 149, 70);
            color: white;
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
            .hierarchy-controls {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .hierarchy-controls > * {
                margin-bottom: 8px;
                width: 100%;
            }
            
            .hierarchy-stats {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    `,
};

// Status colors with Ridhira theme
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

// Simplified hierarchy tree component
const LeadHierarchyTree: React.FC<{ data: PartnerNode[] }> = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'with-leads' | 'with-subpartners'>('all');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);

    // Debug logging
    useEffect(() => {
        if (data) {
            console.log('LeadHierarchyTree received data:', data.length, 'items');
        } else {
            console.log('LeadHierarchyTree received no data');
        }
    }, [data]);

    // Expand all nodes by default
    useEffect(() => {
        if (data && data.length > 0) {
            const keys: React.Key[] = [];
            const collectKeys = (nodes: PartnerNode[]) => {
                nodes.forEach(node => {
                    keys.push(node.partnerId);
                    if (node.subPartners && node.subPartners.length > 0) {
                        collectKeys(node.subPartners);
                    }
                });
            };
            collectKeys(data);
            setExpandedKeys(keys);
        }
    }, [data]);

    // Custom status tag component
    const StatusTag = ({ status }: { status: string }) => {
        const tagClass = getStatusTagClass(status);
        return <span className={tagClass}>{status}</span>;
    };

    // Simplified custom node rendering for better visualization
    const renderCustomNode = (node: any) => {
        const isPartner = !node.key.toString().startsWith('lead-');
        const hasSubpartners = (partner: PartnerNode) => partner.subPartners && partner.subPartners.length > 0;
        const isHovered = hoveredKey === node.key;

        if (isPartner) {
            const partner = node.data as PartnerNode;
            const isPrimary = hasSubpartners(partner);

            return (
                <div
                    style={{
                        ...styles.nodeContainer,
                        ...(isHovered ? styles.nodeContainerHover : {}),
                        ...(isPrimary ? styles.primaryPartnerNode : styles.subPartnerNode)
                    }}
                    onMouseEnter={() => setHoveredKey(node.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div style={styles.partnerIcon}>
                                <User size={16} color="rgb(204, 169, 90)" />
                            </div>
                            <div>
                                <div style={styles.headerTitle}>{partner.partnerName}</div>
                                <div className="flex items-center text-gray-500 text-xs">
                                    {partner.Phone_Number && (
                                        <span className="flex items-center mr-3">
                                            <Phone size={12} className="mr-1 text-gray-400" />
                                            {partner.Phone_Number}
                                        </span>
                                    )}
                                    {partner.Email && (
                                        <span className="flex items-center">
                                            <Mail size={12} className="mr-1 text-gray-400" />
                                            {partner.Email}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            <span style={styles.statBadge}>
                                <span style={{ color: 'rgb(204, 169, 90)', fontWeight: 500 }}>{partner.leads?.length || 0}</span> leads
                            </span>
                            {partner.subPartners && partner.subPartners.length > 0 && (
                                <span style={styles.statBadge}>
                                    <span style={{ color: 'rgb(204, 169, 90)', fontWeight: 500 }}>{partner.subPartners?.length || 0}</span> partners
                                </span>
                            )}
                        </div>
                    </div>
                    {partner.leads && partner.leads.length > 0 && partner.leads.length <= 5 && (
                        <div className="mt-2">
                            {partner.leads.map(lead => (
                                <div key={lead.id} style={styles.leadNode}
                                    onMouseEnter={() => setHoveredKey(`lead-${lead.id}`)}
                                    onMouseLeave={() => setHoveredKey(null)}
                                    className={`${hoveredKey === `lead-${lead.id}` ? 'border-primary-gold' : ''}`}
                                >
                                    <div style={styles.leadIcon}>
                                        <User size={12} color="rgb(19, 36, 48)" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700 flex items-center">
                                            {lead.LeadName}
                                            {lead.Lead_Status === 'Converted' && (
                                                <Star size={12} className="ml-1 text-amber-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="text-xs text-gray-500">
                                                {lead.Phone_Number && lead.Phone_Number}
                                            </div>
                                            {lead.Lead_Status && (
                                                <StatusTag status={lead.Lead_Status} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {partner.leads && partner.leads.length > 5 && (
                        <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>This partner has {partner.leads.length} leads</span>
                                <div className="flex gap-1">
                                    {Array.from(new Set(partner.leads.map(l => l.Lead_Status))).map(status => (
                                        status && <StatusTag key={status} status={status} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            // Lead node (only displayed when not already shown in the parent card)
            const lead = node.data as Lead;
            const parentPartner = data.find(partner =>
                partner.leads.some(l => l.id === lead.id) ||
                partner.subPartners?.some(sp => sp.leads.some(l => l.id === lead.id))
            );

            // If the lead is displayed in a parent with 5 or fewer leads, don't show it again
            if (parentPartner && parentPartner.leads.length <= 5) {
                return null;
            }

            return (
                <div
                    style={styles.leadNode}
                    onMouseEnter={() => setHoveredKey(node.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    className={`${isHovered ? 'border-primary-gold' : ''}`}
                >
                    <div style={styles.leadIcon}>
                        <User size={12} color="rgb(19, 36, 48)" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 flex items-center">
                            {lead.LeadName}
                            {lead.Lead_Status === 'Converted' && (
                                <Star size={12} className="ml-1" style={{ color: 'rgb(204, 169, 90)' }} />
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-gray-500">
                                {lead.Phone_Number && lead.Phone_Number}
                            </div>
                            {lead.Lead_Status && (
                                <StatusTag status={lead.Lead_Status} />
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Transform data for tree display with simplified structure
    const transformToTreeData = (nodes: PartnerNode[]): any[] => {
        if (!nodes || nodes.length === 0) return [];

        return nodes.map(node => ({
            key: node.partnerId,
            title: renderCustomNode,
            data: node,
            children: [
                // Only include leads as separate nodes if there are more than 5
                ...(node.leads && node.leads.length > 5
                    ? node.leads.map(lead => ({
                        key: `lead-${lead.id}`,
                        title: renderCustomNode,
                        data: lead,
                        isLeaf: true,
                    }))
                    : []),
                ...transformToTreeData(node.subPartners || [])
            ],
        }));
    };

    // Filter data based on search and filter criteria
    const filterData = (nodes: PartnerNode[]): PartnerNode[] => {
        if (!nodes) return [];

        return nodes.filter(node => {
            const matchesSearch =
                searchTerm === '' ||
                (node.partnerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (node.leads?.some(lead =>
                    (lead.LeadName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (lead.Phone_Number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                    (lead.Lead_Status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                ) || false);

            const matchesType =
                filterType === 'all' ||
                (filterType === 'with-leads' && node.leads && node.leads.length > 0) ||
                (filterType === 'with-subpartners' && node.subPartners && node.subPartners.length > 0);

            const subPartnerMatches: boolean = node.subPartners && node.subPartners.length > 0
                ? filterData(node.subPartners).length > 0
                : false;

            return (matchesSearch || subPartnerMatches) && matchesType;
        });
    };

    const filteredData = filterData(data);
    const treeData = transformToTreeData(filteredData);

    const onExpand = (expandedKeys: React.Key[]) => {
        setExpandedKeys(expandedKeys);
    };

    if (!data || data.length === 0) {
        return (
            <Empty
                description={
                    <div style={{ color: 'rgb(19, 36, 48)' }}>
                        No hierarchy data available. Try refreshing the data.
                    </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-8 bg-gray-50 rounded-lg border border-gray-200"
            />
        );
    }

    return (
        <div className="lead-hierarchy-view">
            <style>{styles.customStyles}</style>
            <div className="hierarchy-filter-container">
                <div className="hierarchy-filter-header">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5" style={{ color: 'rgb(204, 169, 90)' }} />
                        <h3 className="text-base font-medium">Filter Partner Hierarchy</h3>
                    </div>
                </div>
                <div className="p-4">
                    <div className="hierarchy-controls flex flex-wrap gap-3 mb-4">
                        <Input
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            placeholder="Search partners or leads..."
                            onChange={e => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                            allowClear
                            style={{ borderColor: 'rgb(204, 169, 90)' }}
                        />
                        <Select
                            defaultValue="all"
                            onChange={(value: 'all' | 'with-leads' | 'with-subpartners') => setFilterType(value)}
                            options={[
                                { value: 'all', label: 'All Partners' },
                                { value: 'with-leads', label: 'Partners with Leads' },
                                { value: 'with-subpartners', label: 'Partners with Sub-partners' },
                            ]}
                            className="min-w-[200px]"
                            style={{ borderColor: 'rgb(204, 169, 90)' }}
                        />
                        <Button
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                            }}
                            className="border-primary-gold text-dark-navy"
                        >
                            Reset Filters
                        </Button>
                    </div>

                    <div className="flex justify-between items-center flex-wrap hierarchy-stats">
                        <div className="flex items-center text-gray-600 flex-wrap">
                            <Badge status="processing" color="rgb(204, 169, 90)" />
                            <span className="ml-2 mr-3 font-medium">Partners: {data.length}</span>
                            <Divider type="vertical" className="hidden sm:block border-gray-200" />
                            <Badge status="success" color="rgb(87, 148, 133)" />
                            <span className="ml-2 font-medium">Filtered: {filteredData.length}</span>
                        </div>
                        <div className="mt-2 sm:mt-0 hierarchy-actions">
                            <Button
                                type="text"
                                onClick={() => setExpandedKeys(treeData.map(item => item.key))}
                                icon={<ChevronRight size={14} className="mr-1" />}
                            >
                                Expand All
                            </Button>
                            <Button
                                type="text"
                                onClick={() => setExpandedKeys([])}
                                className="ml-2"
                            >
                                Collapse All
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {treeData.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-auto">
                    <Tree
                        showLine={{ showLeafIcon: false }}
                        treeData={treeData}
                        expandedKeys={expandedKeys}
                        onExpand={onExpand}
                        className="partner-hierarchy-tree"
                        blockNode
                    />
                </div>
            ) : (
                <Empty
                    description={
                        <div style={{ color: 'rgb(19, 36, 48)' }}>
                            No results match your search criteria
                        </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="bg-gray-50 p-8 rounded-lg shadow-sm border border-gray-200"
                />
            )}
        </div>
    );
};

export default LeadHierarchyTree;